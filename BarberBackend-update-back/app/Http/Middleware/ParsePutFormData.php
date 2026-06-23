<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

class ParsePutFormData
{
    public function handle(Request $request, Closure $next)
    {
        if (in_array($request->method(), ['PUT', 'PATCH'])) {
            $contentType = $request->header('Content-Type', '');
            if (str_contains($contentType, 'multipart/form-data')) {
                $this->parseMultipart($request, $contentType);
            }
        }

        return $next($request);
    }

    private function parseMultipart(Request $request, string $contentType): void
    {
        preg_match('/boundary=([^\s;]+)/', $contentType, $matches);
        if (empty($matches[1])) {
            return;
        }

        $boundary = trim($matches[1], '"');
        $rawBody  = file_get_contents('php://input');

        // Split into parts
        $parts = preg_split('/--' . preg_quote($boundary, '/') . '(?:--)?/', $rawBody);

        $data  = [];
        $files = [];

        foreach ($parts as $part) {
            $part = ltrim($part, "\r\n");
            if (empty($part) || $part === '--') {
                continue;
            }

            // Separate headers from body
            $pos = strpos($part, "\r\n\r\n");
            if ($pos === false) {
                continue;
            }

            $rawHeaders = substr($part, 0, $pos);
            $body       = rtrim(substr($part, $pos + 4), "\r\n");

            // Parse headers
            $headers = [];
            foreach (explode("\r\n", $rawHeaders) as $line) {
                if (str_contains($line, ':')) {
                    [$key, $val] = explode(':', $line, 2);
                    $headers[strtolower(trim($key))] = trim($val);
                }
            }

            // Extract field name
            if (!isset($headers['content-disposition'])) {
                continue;
            }

            preg_match('/name="([^"]+)"/', $headers['content-disposition'], $nameMatch);
            if (empty($nameMatch[1])) {
                continue;
            }
            $name = $nameMatch[1];

            // File upload
            if (preg_match('/filename="([^"]*)"/', $headers['content-disposition'], $fileMatch)) {
                $filename = $fileMatch[1];
                $mime     = $headers['content-type'] ?? 'application/octet-stream';

                $tmp = tempnam(sys_get_temp_dir(), 'put_upload_');
                file_put_contents($tmp, $body);

                $files[$name] = new UploadedFile($tmp, $filename, trim($mime), null, true);
            } else {
                // Text field
                $data[$name] = $body;
            }
        }

        if (!empty($data)) {
            $request->request->add($data);
        }

        if (!empty($files)) {
            $request->files->add($files);
        }
    }
}
