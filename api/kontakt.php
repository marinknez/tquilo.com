<?php
/**
 * Primatelj kontakt forme.
 *
 * Zašto PHP: site je statičan i stoji na Hostingeru (Apache/LiteSpeed). Astro
 * API ruta bi tražila Node runtime kojeg ondje nema, a vanjski servis
 * (Formspree i slični) znači da podaci posjetitelja odlaze trećoj strani i da
 * CSP mora pustiti stranu domenu. Ovako sve ostaje na vlastitoj domeni.
 *
 * ⚠ PRIJE LANSIRANJA: postaviti $TO na pravu adresu.
 */

declare(strict_types=1);

// --- konfiguracija ----------------------------------------------------------
$TO      = 'info@tquilo.com';          // ⚠ zamijeniti pravom adresom
$SUBJECT = 'tquilo.com - upit s weba';
$MAX_LEN = ['name' => 120, 'email' => 190, 'message' => 4000];
$RATE_SECONDS = 30;                     // najmanji razmak između dva slanja s istog IP-a

// --- pomoćne ----------------------------------------------------------------
function wantsJson(): bool {
    return str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
}

function respond(int $code, string $message): never {
    http_response_code($code);
    if (wantsJson()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $code < 400, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        echo "<!doctype html><meta charset=utf-8><title>T&#8217;quilo</title>"
           . "<body style=\"font:16px/1.6 system-ui;background:#0B1622;color:#F6F3EE;padding:10vh 8vw\">"
           . "<p>$safe</p><p><a style=\"color:#D8C29A\" href=\"/\">&larr; tquilo.com</a></p>";
    }
    exit;
}

/** Ukloni sve što bi u zaglavlju e-maila moglo postati novi redak. */
function headerSafe(string $v): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
}

// --- provjere ---------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, 'Method not allowed.');
}

// Honeypot: polje je skriveno posjetitelju. Ako je puno, tiho potvrdi -
// bot ne smije doznati da je odbijen.
if (!empty($_POST['website'])) {
    respond(200, 'Hvala.');
}

// Jednostavno ograničenje učestalosti po IP-u. Ne štiti od distribuiranog
// spama, ali odbija najjeftiniji scenarij bez ikakve baze.
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'x';
$lock = sys_get_temp_dir() . '/tquilo-' . hash('sha256', $ip) . '.lock';
if (is_file($lock) && (time() - filemtime($lock)) < $RATE_SECONDS) {
    respond(429, 'Previše pokušaja. Pričekajte trenutak.');
}

$lang    = ($_POST['lang'] ?? 'hr') === 'en' ? 'en' : 'hr';
$name    = headerSafe((string)($_POST['name'] ?? ''));
$email   = headerSafe((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    respond(422, $lang === 'en' ? 'Please fill in all fields.' : 'Molimo ispunite sva polja.');
}
if (mb_strlen($name) > $MAX_LEN['name']
    || mb_strlen($email) > $MAX_LEN['email']
    || mb_strlen($message) > $MAX_LEN['message']) {
    respond(422, $lang === 'en' ? 'The message is too long.' : 'Poruka je predugačka.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, $lang === 'en' ? 'Invalid e-mail address.' : 'Neispravna e-mail adresa.');
}

// --- slanje -----------------------------------------------------------------
$body = "Ime:     $name\n"
      . "E-mail:  $email\n"
      . "Jezik:   $lang\n"
      . "IP:      $ip\n"
      . "Vrijeme: " . gmdate('c') . "\n\n"
      . $message . "\n";

// From mora biti adresa NA vlastitoj domeni, inače SPF/DMARC odbiju poruku.
// Posjetiteljeva adresa ide u Reply-To.
$headers = [
    'From: T\'quilo <no-reply@tquilo.com>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    'X-Mailer: tquilo.com',
];

$sent = @mail($TO, '=?UTF-8?B?' . base64_encode($SUBJECT) . '?=', $body, implode("\r\n", $headers));

if (!$sent) {
    respond(502, $lang === 'en'
        ? 'Sending failed. Please try again later.'
        : 'Slanje nije uspjelo. Pokušajte kasnije.');
}

@touch($lock);
respond(200, $lang === 'en' ? 'Enquiry sent.' : 'Upit je poslan.');
