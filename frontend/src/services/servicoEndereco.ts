export type ViaCepAddress = {
  erro?: boolean
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
}

export async function lookupCep(cep: string): Promise<ViaCepAddress> {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  if (!response.ok) throw new Error('Falha ao consultar o CEP.')
  return response.json() as Promise<ViaCepAddress>
}
