export async function getPaymentMethods() {
  const res = await fetch("/api/methods");
  if (!res.ok) {
    throw new Error("Failed to fetch payment methods");
  }
  console.log("Printing inside services:", res);
  return res.json();
}
