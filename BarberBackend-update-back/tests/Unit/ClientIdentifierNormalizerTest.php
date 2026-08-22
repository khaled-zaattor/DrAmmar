<?php

namespace Tests\Unit;

use App\Services\ClientIdentifierNormalizer;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class ClientIdentifierNormalizerTest extends TestCase
{
    #[DataProvider('phoneProvider')]
    public function test_it_normalizes_supported_phone_formats(?string $input, ?string $expected): void
    {
        $this->assertSame($expected, (new ClientIdentifierNormalizer)->phone($input));
    }

    public static function phoneProvider(): array
    {
        return [
            'US punctuation' => ['(813) 555-0100', '+18135550100'],
            'US ten digits' => ['8135550100', '+18135550100'],
            'US country code' => ['1 813 555 0100', '+18135550100'],
            'explicit international' => ['+44 20 7946 0958', '+442079460958'],
            'international without plus' => ['999 999 999 999', '+999999999999'],
            'seven digit local value' => ['555-0100', '+5550100'],
            'empty' => ['  ', null],
            'extension is not grouped' => ['8135550100 ext 4', null],
            'too short value' => ['555-010', null],
        ];
    }

    public function test_it_normalizes_email_without_changing_plus_tags_or_dots(): void
    {
        $normalizer = new ClientIdentifierNormalizer;

        $this->assertSame('ali.smith+vip@example.com', $normalizer->email('  Ali.Smith+VIP@Example.COM '));
        $this->assertNull($normalizer->email('not-an-email'));
    }
}
