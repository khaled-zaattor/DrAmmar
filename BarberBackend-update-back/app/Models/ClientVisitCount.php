<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientVisitCount extends Model
{
    protected $fillable = [
        'identifier_type',
        'normalized_identifier',
        'visit_count',
        'last_calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'visit_count' => 'integer',
            'last_calculated_at' => 'datetime',
        ];
    }

    public function countedVisits(): HasMany
    {
        return $this->hasMany(CountedAppointmentVisit::class);
    }
}
