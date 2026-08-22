<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CountedAppointmentVisit extends Model
{
    protected $fillable = [
        'source_appointment_id',
        'client_visit_count_id',
        'identifier_type',
        'normalized_identifier',
        'counted_at',
    ];

    protected function casts(): array
    {
        return [
            'source_appointment_id' => 'integer',
            'counted_at' => 'datetime',
        ];
    }

    public function clientVisitCount(): BelongsTo
    {
        return $this->belongsTo(ClientVisitCount::class);
    }
}
