<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $tables = DB::select('SHOW TABLES');
    $dbName = config('database.connections.mysql.database');
    $prop = "Tables_in_" . $dbName;

    $tableNames = [];
    $tableCounts = [];
    foreach ($tables as $table) {
        $tableArray = (array) $table;
        $name = current($tableArray);
        $tableNames[] = $name;
        $tableCounts[$name] = DB::table($name)->count();
    }
    file_put_contents('tables_clean.json', json_encode([
        'tables' => $tableNames,
        'counts' => $tableCounts
    ], JSON_PRETTY_PRINT));
    echo "Done" . PHP_EOL;
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
