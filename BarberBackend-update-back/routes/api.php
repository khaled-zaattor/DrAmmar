<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BarberController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\Admin\AvailabilityController as AdminAvailabilityController;
use App\Http\Controllers\Api\Admin\BarberScheduleController;
use App\Http\Controllers\Api\Admin\BlockedSlotController;
use App\Http\Controllers\Api\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — No authentication required
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/login', [AuthController::class, 'login']);

// Contact form
Route::post('/contact', [ContactController::class, 'store']);

// Services (public listing)
Route::get('/services/top-booked', [ServiceController::class, 'topBooked']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);

// Categories (public listing)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Barbers (public listing)
Route::get('/barbers', [BarberController::class, 'index']);
Route::get('/barbers/{barber}', [BarberController::class, 'show']);

// Availability checker
Route::get('/availability',    [AvailabilityController::class, 'index']);
Route::get('/business-hours',  [AvailabilityController::class, 'businessHours']);

// Book an appointment (public)
Route::post('/appointments', [AppointmentController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes — Sanctum token required
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    /*
    |--------------------------------------------------------------------------
    | Admin + Receptionist only routes
    | (services, barber profiles, business hours, follow-up, users)
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin,receptionist')
        ->prefix('admin')
        ->group(function () {

            // Categories management
            Route::get('categories',                         [Admin\CategoryController::class, 'index']);
            Route::post('categories',                        [Admin\CategoryController::class, 'store']);
            Route::put('categories/{category}',              [Admin\CategoryController::class, 'update']);
            Route::delete('categories/{category}',           [Admin\CategoryController::class, 'destroy']);
            Route::patch('categories/{category}/toggle',     [Admin\CategoryController::class, 'toggle']);

            // Services management
            Route::get('services',                           [Admin\ServiceController::class, 'index']);
            Route::post('services',                          [Admin\ServiceController::class, 'store']);
            Route::put('services/{service}',                 [Admin\ServiceController::class, 'update']);
            Route::delete('services/{service}',              [Admin\ServiceController::class, 'destroy']);
            Route::patch('services/{service}/toggle',        [Admin\ServiceController::class, 'toggle']);

            // Barbers management
            Route::get('barbers',                 [Admin\BarberController::class, 'index']);
            Route::post('barbers',                [Admin\BarberController::class, 'store']);
            Route::put('barbers/{barber}',        [Admin\BarberController::class, 'update']);
            Route::delete('barbers/{barber}',     [Admin\BarberController::class, 'destroy']);

            // Follow-up email settings
            Route::post('follow-up-settings', [Admin\FollowUpController::class, 'store']);

            // Business hours (admin/receptionist only)
            Route::post('business-hours', [AdminAvailabilityController::class, 'updateBusinessHours']);

            // Persist non-cancelled appointment totals for each client identifier
            Route::post('appointments/sync-visit-counts', [Admin\AppointmentController::class, 'syncVisitCounts']);

            // User management + bulk admin actions (admin only — nested group)
            Route::middleware('role:admin')->group(function () {
                Route::get('users',                         [UserController::class, 'index']);
                Route::get('users/linkable-barbers',        [UserController::class, 'linkableBarbers']);
                Route::post('users',                        [UserController::class, 'store']);
                Route::put('users/{user}',                  [UserController::class, 'update']);
                Route::put('users/{user}/password',         [UserController::class, 'changePassword']);
                Route::delete('users/{user}',               [UserController::class, 'destroy']);

                // Bulk delete past appointments
                Route::delete('appointments/bulk-delete-old',  [Admin\AppointmentController::class, 'bulkDeleteOld']);

                // Blocked slots: monthly report + bulk delete past
                Route::get('blocked-slots/monthly-report',     [BlockedSlotController::class, 'monthlyReport']);
                Route::delete('blocked-slots/bulk-delete-old', [BlockedSlotController::class, 'bulkDeleteOld']);
            });
        });

    /*
    |--------------------------------------------------------------------------
    | Barber-accessible routes (admin + receptionist + barber)
    | Controllers enforce row-level filtering for barber role
    |--------------------------------------------------------------------------
    */

    Route::middleware('role:admin,receptionist,barber')
        ->prefix('admin')
        ->group(function () {

            // Barbers list (read-only — barbers need this for conflict resolution)
            Route::get('barbers/available-for-reassignment', [Admin\BarberController::class, 'availableForReassignment']);
            Route::get('barbers', [Admin\BarberController::class, 'index']);

            // Appointments (barbers see only their own)
            Route::get('appointments',                    [Admin\AppointmentController::class, 'index']);
            Route::get('appointments/{appointment}',      [Admin\AppointmentController::class, 'show']);
            Route::put('appointments/{appointment}',      [Admin\AppointmentController::class, 'update']);
            Route::delete('appointments/{appointment}',   [Admin\AppointmentController::class, 'destroy']);

            // Availability overview (barbers see only their own data)
            Route::get('availability', [AdminAvailabilityController::class, 'index']);

            // Barber schedules
            Route::post('barber-schedules', [BarberScheduleController::class, 'store']);

            // Blocked slots (barbers see/manage only their own)
            Route::get('blocked-slots',                      [BlockedSlotController::class, 'index']);
            Route::post('blocked-slots',                     [BlockedSlotController::class, 'store']);
            Route::put('blocked-slots/{blockedSlot}',        [BlockedSlotController::class, 'update']);
            Route::delete('blocked-slots/{blockedSlot}',     [BlockedSlotController::class, 'destroy']);
        });
});
