<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessHour extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'day_of_week',
        'open_time',
        'close_time',
        'is_closed',
        'slot_duration',
    ];

    protected function casts(): array
    {
        return [
            'is_closed'     => 'boolean',
            'slot_duration' => 'integer',
        ];
    }

    public static function forDay(int $dayOfWeek): ?self
    {
        return static::where('day_of_week', $dayOfWeek)->first();
    }
}
