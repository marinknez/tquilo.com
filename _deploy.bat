@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

rem ============================================================
rem  KONFIGURACIJA
rem  REPO_URL se koristi samo pri PRVOM pokretanju (za postavljanje
rem  origina). Ako origin vec postoji, koristi se on. Promijeni owner-a
rem  ako nije tocan (npr. SSH: git@github.com:owner/tquilo.com.git).
rem ============================================================
set "REPO_URL=https://github.com/marinknez/tquilo.com.git"
set "MAIN_BRANCH=main"
set "DEPLOY_BRANCH=deploy"

rem  --ci = neinteraktivno (bez 'pause' na kraju). Koristi ga Stop hook
rem  iz .claude/hooks/auto-deploy.sh; rucno pokretanje ostaje kakvo je bilo.
set "NOPAUSE="
if /i "%~1"=="--ci" set "NOPAUSE=1"

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set "STAMP=%%I"
set "MSG=Auto deploy %STAMP%"
set "WORKDIR=%TEMP%\tquilo_deploy_%RANDOM%%RANDOM%"

echo.
echo Folder: %CD%
echo Commit: %MSG%
echo.

where git >nul 2>nul || (echo Git nije dostupan u PATH-u. & goto :fail)
where npm >nul 2>nul || (echo npm nije dostupan u PATH-u. & goto :fail)

rem ============================================================
echo [1/5] Provjera git repoa i origina...

rem --- init repo ako jos ne postoji ---
if not exist ".git" (
  echo     Nije git repo - inicijaliziram...
  git init -b %MAIN_BRANCH% >nul 2>nul || (git init >nul 2>nul && git checkout -b %MAIN_BRANCH% >nul 2>nul)
)

rem --- osiguraj da origin postoji ---
set "ORIGIN_URL="
for /f "delims=" %%U in ('git config --get remote.origin.url 2^>nul') do set "ORIGIN_URL=%%U"
if not defined ORIGIN_URL (
  echo     Postavljam origin: %REPO_URL%
  git remote add origin "%REPO_URL%" || (echo Ne mogu postaviti remote origin. & goto :fail)
  set "ORIGIN_URL=%REPO_URL%"
)
echo     Origin: !ORIGIN_URL!

rem ============================================================
rem  Build ide PRIJE pusha na main: ako build pukne, na GitHub ne ode
rem  nista. Bitno kad ovo okida hook, a ne covjek.
rem ============================================================
echo [2/5] Build...

rem --- ovisnosti (ci ako postoji lockfile, inace install) ---
if not exist "node_modules" (
  echo     node_modules nedostaje - instaliram...
  if exist "package-lock.json" (
    call npm ci --no-audit --no-fund || (echo npm ci nije prosao. & goto :fail)
  ) else (
    call npm install --no-audit --no-fund || (echo npm install nije prosao. & goto :fail)
  )
)

rem --- cisti build ---
if exist "dist" rmdir /s /q "dist"

call npm run build || (echo Build nije prosao. & goto :fail)
if not exist "dist" (echo Dist folder ne postoji nakon builda. & goto :fail)
if not exist "dist\index.html" (echo dist\index.html ne postoji. & goto :fail)
if not exist "dist\.htaccess" (echo UPOZORENJE: dist\.htaccess nedostaje - security headeri nece biti aktivni.)

rem --- provjera SEO/AI izlaza (generiraju se iz src/pages, pa mogu tiho nestati) ---
if not exist "dist\robots.txt" (echo UPOZORENJE: dist\robots.txt nedostaje.)
if not exist "dist\sitemap-index.xml" (echo UPOZORENJE: dist\sitemap-index.xml nedostaje.)
if not exist "dist\llms.txt" (echo UPOZORENJE: dist\llms.txt nedostaje.)
if not exist "dist\404.html" (echo UPOZORENJE: dist\404.html nedostaje - ErrorDocument nece raditi.)
if not exist "dist\og\tquilo-og.png" (echo UPOZORENJE: OG slika nedostaje - social preview ce biti prazan.)

rem ============================================================
echo [3/5] Sync izvora na %MAIN_BRANCH% (dist se NE commita na main)...

rem dist je u .gitignore, ali ako je ranije bio trackan - makni ga s maina
git rm -r --cached --ignore-unmatch dist >nul 2>nul

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "%MSG%" || (echo Commit main nije prosao. & goto :fail)
) else (
  echo     Nema promjena za main.
)

rem osiguraj da je trenutna grana bas main, pa push
git branch -M %MAIN_BRANCH% >nul 2>nul
git push -u origin %MAIN_BRANCH% || (echo Push main nije prosao. & goto :fail)

rem ============================================================
rem  VAZNO za Hostinger auto-deployment:
rem  Hostinger na svojoj strani radi 'git pull' nad vec kloniranim repoom.
rem  Ranija verzija ove skripte radila je 'git init' u temp folderu i
rem  force-push -> svaki deploy je imao NOVU, nepovezanu povijest, pa je
rem  Hostingerov pull padao ("unrelated histories" / non-fast-forward) i
rem  automatski deploy se nije dogodio. Rucni "Deploy" u hPanelu je radio
rem  jer on radi svjez clone.
rem  Zato sada NASTAVLJAMO postojecu povijest deploy grane i pushamo
rem  fast-forward, bez -f.
rem ============================================================
echo [4/5] Priprema deploy grane iz dist...
if exist "%WORKDIR%" rmdir /s /q "%WORKDIR%"
mkdir "%WORKDIR%" || (echo Ne mogu kreirati radni folder. & goto :fail)

pushd "%WORKDIR%" || (echo Ne mogu uci u radni folder. & goto :cleanfail)

git init -q >nul 2>nul || (echo git init nije prosao. & popd & goto :cleanfail)
git remote add origin "%ORIGIN_URL%" >nul 2>nul

set "HAS_DEPLOY="
git fetch -q origin %DEPLOY_BRANCH% >nul 2>nul && set "HAS_DEPLOY=1"

if not defined HAS_DEPLOY goto :newbranch

echo     Nastavljam postojecu '%DEPLOY_BRANCH%' povijest.
git checkout -q -B %DEPLOY_BRANCH% FETCH_HEAD || (echo Checkout deploy nije prosao. & popd & goto :cleanfail)
rem isprazni radno stablo (git nikad ne dira .git), pa stavi svjezi build
git rm -r -q --ignore-unmatch . >nul 2>nul
goto :copydist

:newbranch
echo     Grana '%DEPLOY_BRANCH%' jos ne postoji - kreiram je.
git checkout -q -b %DEPLOY_BRANCH% >nul 2>nul

:copydist
robocopy "%~dp0dist" "%WORKDIR%" /E /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (echo Kopiranje dist nije proslo. & popd & goto :cleanfail)

if not exist "%WORKDIR%\index.html" (echo index.html nije kopiran u deploy. & popd & goto :cleanfail)
if not exist "%WORKDIR%\.htaccess" (echo UPOZORENJE: .htaccess nije kopiran u deploy.)

rem  Deploy grana je cisti web root - .gitignore s maina ovdje ne smije
rem  vrijediti, inace bi 'git add -A' preskocio dio builda.
if exist "%WORKDIR%\.gitignore" del /q "%WORKDIR%\.gitignore"

rem --allow-empty: i kad je build bajt-u-bajt isti, treba nastati commit
rem da GitHub posalje webhook i Hostinger povuce promjenu.
git add -A
git commit -q --allow-empty -m "%MSG% [dist]" || (echo Commit deploy nije prosao. & popd & goto :cleanfail)

echo [5/5] Push deploy grane na GitHub...
git push -q origin %DEPLOY_BRANCH%:%DEPLOY_BRANCH%
if not errorlevel 1 goto :pushed

echo     Fast-forward push odbijen - netko je u meduvremenu pushao na
echo     '%DEPLOY_BRANCH%'. Ponavljam sa svjezim fetchom...
git fetch -q origin %DEPLOY_BRANCH% >nul 2>nul
git reset -q --soft FETCH_HEAD
git commit -q --allow-empty -m "%MSG% [dist]" >nul 2>nul
git push -q origin %DEPLOY_BRANCH%:%DEPLOY_BRANCH% || (echo Deploy push nije prosao. & popd & goto :cleanfail)

:pushed
set "DEPLOY_SHA="
for /f "delims=" %%S in ('git rev-parse --short HEAD') do set "DEPLOY_SHA=%%S"

popd
rmdir /s /q "%WORKDIR%"

echo.
echo Gotovo. Izvor na '%MAIN_BRANCH%', build na '%DEPLOY_BRANCH%' (!DEPLOY_SHA!).
echo.
echo Ako se site nije osvjezio, provjeri u GitHubu:
echo   Settings - Webhooks - zadnja isporuka mora biti 200 (Hostingerov URL).
echo   Bez registriranog webhooka auto-deployment se nikad ne okida.
exit /b 0

rem ============================================================
:cleanfail
if exist "%WORKDIR%" rmdir /s /q "%WORKDIR%"
:fail
echo.
echo SYNC NIJE USPIO - pogledaj poruku iznad.
if not defined NOPAUSE pause
exit /b 1
