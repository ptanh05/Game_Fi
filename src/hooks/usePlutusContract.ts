import { useEffect, useState } from 'react';

export function usePlutusContract() {
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    fetch('/api/plutus-contract')
      .then(res => res.json())
      .then(setContract)
      .catch(() => setContract(null));
  }, []);

  return contract;
} 