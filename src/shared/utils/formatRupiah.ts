export const formatRupiah = (n: number): string => 
  `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
