import './globals.css'

export const metadata = {
  title: 'Animal Werewolf Admin',
  description: 'Admin dashboard for Animal Werewolf game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}