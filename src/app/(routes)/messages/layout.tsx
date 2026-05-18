import React from "react";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-80px)] bg-off-white">
      {children}
    </div>
  );
}
