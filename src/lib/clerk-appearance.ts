export const clerkAppearance = {
  variables: {
    colorPrimary: "#4B3F72",
    colorBackground: "#0e1119",
    colorInputBackground: "#141b2d",
    colorInputText: "#f1f5f9",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorDanger: "#b91c1c",
    borderRadius: "0.375rem",
    fontFamily: "var(--font-jakarta), system-ui, sans-serif",
  },
  elements: {
    formButtonPrimary:
      "bg-primary hover:bg-accent text-off-white text-xs font-bold uppercase tracking-[0.14em] py-3 rounded-md transition-all shadow-[0_0_24px_rgba(75,63,114,0.25)] hover:shadow-[0_0_32px_rgba(198,166,100,0.12)]",
    card: "shadow-none border border-accent/30 bg-surface-elevated/80 backdrop-blur-md rounded-lg",
    headerTitle: "text-off-white font-display font-semibold tracking-academy uppercase text-xl",
    headerSubtitle: "text-steel-blue font-medium text-sm",
    footerActionLink: "text-accent-soft hover:text-gold font-semibold transition-colors",
    formFieldInput:
      "bg-surface border border-accent/30 rounded-md p-3 text-off-white focus:ring-1 focus:ring-accent/50 transition-all",
    formFieldLabel:
      "text-[10px] font-bold uppercase tracking-[0.12em] text-steel-blue mb-1",
    socialButtonsBlockButton:
      "border border-accent/30 bg-surface text-off-white hover:bg-primary/50",
    dividerLine: "bg-accent/30",
    dividerText: "text-steel-blue text-xs uppercase tracking-widest",
    footer: "hidden",
  },
};
