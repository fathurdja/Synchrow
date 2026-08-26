# 📋 HRIS — Desain Role & Hak Akses (Multi-Departemen)

Dokumen ini merupakan lanjutan dari `HRIS_Project_Plan.md`, fokus khusus pada **struktur user, role, dan privilege** agar HRIS bisa dikelola secara **desentralisasi per departemen**, dengan **data finansial (gaji/slip gaji) hanya bisa diakses oleh Finance**.

---

## 1. Prinsip Utama Desain Akses

1. **Data-scoping per departemen** — setiap Manager hanya bisa melihat/mengelola data karyawan di departemennya sendiri, bukan lintas departemen.
2. **Segregasi data finansial** — payroll, slip gaji, komponen gaji, potongan pajak/BPJS **hanya bisa diakses role Finance & Super Admin**. Manager dan HR Admin biasa **tidak** bisa melihat nominal gaji.
3. **Role bukan hierarki tunggal** — satu user bisa punya kombinasi role (misal: Manager Divisi Marketing sekaligus karyawan biasa untuk urusan cuti dirinya sendiri).
4. **Prinsip least privilege** — setiap role hanya diberi akses seminimal mungkin sesuai kebutuhan tugasnya.

---

## 2. Struktur Role (Privileges)

| Role | Level | Deskripsi |
|---|---|---|
| **Super Admin** | Global | Kontrol penuh sistem: setup departemen, kelola semua user/role, konfigurasi pajak & BPJS, akses semua modul termasuk finansial |
| **Finance/Payroll Admin** | Global | **Satu-satunya role (selain Super Admin)** yang boleh akses payroll, slip gaji, komponen gaji, laporan finansial. Tidak bisa approve cuti/absensi |
| **HR Admin** | Global (non-finansial) | Kelola master data karyawan, divisi, kebijakan cuti, dan laporan absensi **seluruh perusahaan**, tapi **tidak bisa lihat nominal gaji** |
| **Department Manager (Admin Departemen)** | Scoped ke departemennya | Approve/reject cuti & pantau absensi karyawan **di departemennya sendiri saja**. Tidak bisa akses data departemen lain maupun data finansial |
| **Employee (Karyawan)** | Personal (diri sendiri) | Akses ESS: absen, ajukan cuti, lihat slip gaji milik sendiri, update data diri sendiri |

> 💡 **Catatan penting**: "Lihat slip gaji milik sendiri" oleh Employee **tetap diperbolehkan** (karena itu haknya sendiri) — larangan aksesnya adalah untuk **melihat gaji orang lain**. Endpoint payslip tetap perlu di bawah kontrol modul Finance (Finance yang generate & publish, karyawan hanya read-only miliknya sendiri).

---

## 3. Matriks Hak Akses per Modul

| Modul / Aksi | Super Admin | Finance Admin | HR Admin | Dept. Manager | Employee |
|---|:---:|:---:|:---:|:---:|:---:|
| Kelola Departemen & Struktur Organisasi | ✅ | ❌ | ✅ | ❌ | ❌ |
| Kelola User & Role Assignment | ✅ | ❌ | ✅ (kecuali ubah role Finance) | ❌ | ❌ |
| Absensi — Check-in/out (diri sendiri) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lihat absensi tim di departemennya | ✅ | ❌ | ✅ (semua dept) | ✅ (hanya dept sendiri) | ❌ |
| Edit/koreksi data absensi | ✅ | ❌ | ✅ (semua dept) | ✅ (hanya dept sendiri) | ❌ |
| Approve/Reject pengajuan cuti | ✅ | ❌ | ✅ (eskalasi/final) | ✅ (hanya dept sendiri) | ❌ (hanya ajukan) |
| Ajukan cuti (diri sendiri) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lihat laporan absensi (PDF/Excel) | ✅ | ❌ | ✅ (semua dept) | ✅ (hanya dept sendiri) | ❌ |
| **Lihat/Generate Payroll & Slip Gaji (semua karyawan)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Lihat slip gaji milik sendiri** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Konfigurasi tarif Pajak (PPh21) & BPJS | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update data diri sendiri (ESS) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve perubahan data sensitif (rekening, dll) | ✅ | ✅ (khusus data rekening) | ✅ (khusus data non-finansial) | ❌ | ❌ (hanya ajukan) |
| Audit Log seluruh sistem | ✅ | ❌ (hanya log finansial) | ❌ | ❌ | ❌ |

---

## 4. Alur Approval Cuti (Departemen-scoped)

```
Karyawan (Dept. Marketing) ajukan cuti
        ↓
Manager Dept. Marketing (Admin Departemen) → Approve/Reject
        ↓ (jika disetujui)
Sistem otomatis update saldo cuti & kalender tim
        ↓ (opsional, untuk kasus tertentu: cuti >X hari / cuti khusus)
Eskalasi ke HR Admin untuk approval final
```

- Manager **hanya melihat notifikasi & daftar pengajuan dari departemennya sendiri**
- Jika karyawan pindah departemen, histori cuti tetap ada tapi approval routing mengikuti departemen baru
- HR Admin bisa melakukan **override** jika Manager tidak merespon dalam SLA tertentu (misal 2x24 jam)

---

## 5. Implementasi Teknis (Laravel)

### 5.1 Struktur Tabel Tambahan untuk Role & Scoping

```
roles                (id, name)                     -- super_admin, finance, hr_admin, dept_manager, employee
user_roles           (id, user_id, role_id)          -- 1 user bisa punya >1 role
departments           (id, name, manager_id)          -- manager_id = user yang jadi admin departemen ini
employees             (id, user_id, department_id, ...)
```

### 5.2 Middleware & Policy (Laravel)

Gunakan kombinasi:
- **Spatie Laravel-Permission** package → untuk manajemen role & permission secara fleksibel
- **Laravel Policy** per model (`AttendancePolicy`, `LeaveRequestPolicy`, `PayrollPolicy`) untuk scoping data per departemen

Contoh pseudocode Policy untuk scoping departemen:

```php
// LeaveRequestPolicy.php
public function approve(User $user, LeaveRequest $leave)
{
    if ($user->hasRole('super_admin') || $user->hasRole('hr_admin')) {
        return true;
    }
    if ($user->hasRole('dept_manager')) {
        // hanya boleh approve jika karyawan tsb berada di departemen yang sama
        return $user->managedDepartment->id === $leave->employee->department_id;
    }
    return false;
}
```

```php
// PayrollPolicy.php
public function view(User $user, Payroll $payroll)
{
    if ($user->hasRole('super_admin') || $user->hasRole('finance')) {
        return true;
    }
    // employee hanya boleh lihat payroll miliknya sendiri
    return $user->employee->id === $payroll->employee_id;
}
```

### 5.3 Contoh Middleware Route Grouping

```php
// routes/api.php

Route::middleware(['auth:sanctum', 'role:finance,super_admin'])->group(function () {
    Route::get('/payroll/{employee_id}', [PayrollController::class, 'show']);
    Route::post('/payroll/generate', [PayrollController::class, 'generate']);
    Route::get('/payroll/export', [PayrollController::class, 'export']);
});

Route::middleware(['auth:sanctum', 'role:dept_manager,hr_admin,super_admin'])->group(function () {
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']); // otomatis di-scope via Policy/Query
    Route::put('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/ess/payslip/{period}', [EssController::class, 'myPayslip']); // employee lihat slip sendiri
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
});
```

> Query di controller untuk Dept. Manager selalu di-filter otomatis: `->where('department_id', $user->managedDepartment->id)` agar tidak bocor ke departemen lain, meskipun request dimanipulasi dari frontend.

### 5.4 Frontend (React) — Adaptasi UI per Role

- Setelah login, backend mengembalikan `roles[]` dan `permissions[]` dalam payload user
- Gunakan **Route Guard** (`ProtectedRoute` component) untuk membatasi akses halaman:
  - `/payroll/*` → hanya bisa diakses jika role mengandung `finance` atau `super_admin`
  - `/department/:id/attendance` → hanya manager dept tersebut / HR / Super Admin
  - `/ess/*` → semua role bisa akses (untuk data pribadi)
- Sidebar menu render kondisional berdasarkan role (jangan andalkan hide-UI saja sebagai keamanan — **backend tetap wajib validasi ulang**)

---

## 6. Rekomendasi Keamanan Tambahan untuk Segregasi Data Finansial

- Buat **database-level separation** (opsional untuk skala besar): tabel `payrolls`, `salary_components`, `tax_configs` bisa dipisah ke schema/connection tersendiri yang hanya bisa diakses service Finance
- **Audit log khusus** untuk semua akses ke data payroll (siapa buka, kapan, data siapa) — penting untuk kepatuhan/compliance
- Slip gaji PDF di-generate dengan **watermark unik per user** dan link **expiring/signed URL**, bukan link publik statis
- Enkripsi kolom nominal gaji & no. rekening di database (`Laravel Encrypted Casts`)
- 2FA wajib untuk role Finance & Super Admin (tambahan di atas Google OAuth)

---

## 7. Ringkasan Diagram Hierarki Akses

```
                     ┌───────────────┐
                     │  Super Admin  │  (akses semua, termasuk finansial)
                     └───────┬───────┘
              ┌──────────────┼───────────────┐
      ┌───────▼──────┐ ┌─────▼──────┐  ┌─────▼───────┐
      │ Finance Admin│ │  HR Admin  │  │ (Global,    │
      │ (Payroll only│ │(non-finance│  │  non-scoped)│
      │  & sensitif) │ │ operasional)│ └─────────────┘
      └──────────────┘ └─────┬──────┘
                              │ mengawasi seluruh dept
                    ┌─────────┼─────────┐
             ┌──────▼─────┐       ┌─────▼──────┐
             │Dept Manager│       │Dept Manager│   ...per departemen
             │ (Marketing)│       │ (Produksi) │
             └──────┬─────┘       └─────┬──────┘
                     │                    │
              ┌──────▼──────┐     ┌──────▼──────┐
              │  Employee   │     │  Employee   │  (akses ESS: data diri sendiri)
              └─────────────┘     └─────────────┘
```

---

## 8. Update Roadmap (Fase Tambahan: Role & Permission)

| Fase | Tambahan Task |
|---|---|
| **Fase 1: Setup & Auth** | + Setup Spatie Permission, seed role default, desain tabel `departments` dengan `manager_id` |
| **Fase 2: Absensi** | + Terapkan scoping query berdasarkan `department_id` untuk Dept. Manager |
| **Fase 3: Cuti & ESS** | + Approval workflow scoped per departemen + eskalasi ke HR |
| **Fase 4: Payroll** | + Isolasi total modul payroll hanya untuk role `finance` & `super_admin`, termasuk audit log |
| **Fase 5: Testing** | + Test khusus **negative testing**: pastikan Manager Dept A tidak bisa akses data Dept B, dan role non-finance benar-benar tidak bisa akses endpoint payroll meski via API langsung (bukan cuma UI) |

---

## 9. Catatan Penting untuk Tim Developer

⚠️ **Jangan hanya mengandalkan penyembunyian menu di frontend** untuk membatasi akses finansial/departemen — ini bisa dibobol dengan memanggil API langsung. Validasi role & scoping **wajib dilakukan di backend (Policy/Middleware)** sebagai lapisan keamanan utama, frontend hanya sebagai UX layer.
