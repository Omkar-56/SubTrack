import Landing from '../views/Landing';

export const metadata = {
  title: 'Subtrack - Track subscriptions. Stay in control.',
  description: 'The intentional, high-clarity subscription ledger. Track recurring services, get alerted before renewals, and keep what you love.',
};

export default function HomePage() {
  return (
    <main className="w-full">
      <Landing />
    </main>
  );
}
