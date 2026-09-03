import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
};

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return <ResetPasswordForm token={params.token} />;
}