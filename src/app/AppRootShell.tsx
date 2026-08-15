type AppRootShellProps = {
  children: React.ReactNode;
};

export default function AppRootShell({ children }: AppRootShellProps) {
  return (
    <div
      className="antialiased bg-sh-background text-sh-foreground flex min-h-screen w-full flex-col"
      style={{
        ['--font-geist-sans' as string]: '"Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif',
        ['--font-geist-mono' as string]: '"SFMono-Regular", "Consolas", monospace',
        ['--font-story' as string]: 'Georgia, "Lora", "Times New Roman", serif',
      }}
    >
      {children}
    </div>
  );
}
