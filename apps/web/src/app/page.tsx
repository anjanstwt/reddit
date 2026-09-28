import AuthButton from '@/components/auth-button';

export default function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Hello, reddit</h1>
      <AuthButton />
    </main>
  );
}
