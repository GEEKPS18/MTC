"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, SectionCard, FormField } from "@/components/shared";
import { formatDate } from "@/lib/formatters";
import { USER_ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@prisma/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setForm({ name: d.name, phone: d.phone ?? "", address: d.address ?? "" });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("الاسم مطلوب"); return; }
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone || null, address: form.address || null }),
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-2xl">
        <div className="h-8 w-48 bg-[#e2e8f0] rounded" />
        <div className="h-64 bg-white rounded-xl border border-[#e2e8f0]" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-16 text-[#64748b]">تعذر تحميل بيانات الملف الشخصي</div>;
  }

  const initials = profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="الملف الشخصي"
        subtitle="إدارة بياناتك الشخصية"
        breadcrumb={[
          { label: "الرئيسية", href: "/dashboard" },
          { label: "الملف الشخصي" },
        ]}
      />

      {/* Avatar + meta */}
      <SectionCard className="mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0b2345] to-[#104e98] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1e293b]">{profile.name}</h2>
            <p className="text-sm text-[#64748b] flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5" /> {profile.email}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-[#e8f0fc] text-[#104e98] px-2.5 py-1 rounded-full font-medium">
                <Shield className="h-3 w-3" />
                {USER_ROLE_LABELS[profile.role]}
              </span>
              <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                عضو منذ {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Edit form */}
      <SectionCard title="تعديل البيانات">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="الاسم الكامل" htmlFor="p-name" required>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="pr-10"
                placeholder="الاسم الكامل"
              />
            </div>
          </FormField>

          <FormField label="البريد الإلكتروني" htmlFor="p-email">
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
              <Input id="p-email" value={profile.email} disabled className="pr-10 bg-[#f8fafc] text-[#94a3b8]" dir="ltr" />
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">لا يمكن تغيير البريد الإلكتروني</p>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="رقم الهاتف" htmlFor="p-phone">
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <Input
                  id="p-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="pr-10"
                  dir="ltr"
                  placeholder="05XXXXXXXX"
                />
              </div>
            </FormField>

            <FormField label="الموقع / العنوان" htmlFor="p-address">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                <Input
                  id="p-address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="pr-10"
                  placeholder="نابلس، فلسطين"
                />
              </div>
            </FormField>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">تم حفظ التغييرات بنجاح</div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </div>
              ) : (
                <><Save className="h-4 w-4" /> حفظ التغييرات</>
              )}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
