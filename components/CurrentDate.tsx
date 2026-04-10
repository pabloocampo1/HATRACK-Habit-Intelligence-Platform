"use client";

export default function CurrentDate() {
  const date = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return <span>{date}</span>;
}
