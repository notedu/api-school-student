import { useState } from 'react'
import { lookupCep } from '../../services/servicoEndereco'
import { formatBirthDate, parseBirthDate } from '../../utils/formatadores'
import { Icon } from './icone'

export function BirthFields() {
  const [birthDate, setBirthDate] = useState('')
  const parsed = parseBirthDate(birthDate)
  return (
    <>
      <div className="field-block">
        <label className="field-label" htmlFor="birth-date">
          Data de nascimento
        </label>
        <input
          id="birth-date"
          className="field"
          name="dataNascimento"
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="dd/mm/aaaa"
          value={birthDate}
          onChange={(event) => setBirthDate(formatBirthDate(event.target.value))}
          maxLength={10}
          pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
          title="Digite no formato dd/mm/aaaa"
          required
        />
      </div>
      <div className="field-block">
        <label className="field-label" htmlFor="birth-age">
          Idade
        </label>
        <input
          id="birth-age"
          className="field"
          name="idade"
          type="number"
          value={parsed?.age ?? ''}
          placeholder="Calculada pela data de nascimento"
          readOnly
          required
        />
      </div>
    </>
  )
}

export function AddressFields() {
  const [address, setAddress] = useState({
    cep: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    numeroCasa: '',
    complemento: '',
  })
  const [status, setStatus] = useState(
    'Digite um CEP para preencher o endereço automaticamente. Você também pode preencher os campos manualmente.',
  )
  async function searchAddress() {
    const cep = address.cep.replace(/\D/g, '')
    if (!cep) return
    if (cep.length !== 8) {
      setStatus('O CEP precisa ter 8 números.')
      return
    }
    setStatus('Buscando endereço…')
    try {
      const result = await lookupCep(cep)
      if (result.erro) {
        setStatus('CEP não encontrado. Preencha o endereço manualmente.')
        return
      }
      setAddress((current) => ({
        ...current,
        rua: result.logradouro ?? '',
        bairro: result.bairro ?? '',
        cidade: result.localidade ?? '',
        estado: result.uf ?? '',
      }))
      setStatus('Endereço preenchido pelo ViaCEP. Confira e complete o número da casa.')
    } catch {
      setStatus('Não foi possível consultar o ViaCEP. Preencha o endereço manualmente.')
    }
  }
  const update = (key: keyof typeof address, value: string) =>
    setAddress((current) => ({ ...current, [key]: value }))
  return (
    <div className="address-fields full-span">
      <div className="address-caption">
        <Icon name="subjects" size={15} /> Endereço <span>ViaCEP</span>
      </div>
      <div className="form-grid">
        <div className="field-block">
          <label className="field-label">CEP</label>
          <input
            className="field"
            name="cep"
            value={address.cep}
            onChange={(event) => update('cep', event.target.value)}
            onBlur={() => void searchAddress()}
            placeholder="00000-000"
          />
        </div>
        <div className="field-block">
          <label className="field-label">Número da casa</label>
          <input
            className="field"
            name="numeroCasa"
            value={address.numeroCasa}
            onChange={(event) => update('numeroCasa', event.target.value)}
            required
          />
        </div>
        <div className="field-block full-span">
          <label className="field-label">Rua</label>
          <input
            className="field"
            name="rua"
            value={address.rua}
            onChange={(event) => update('rua', event.target.value)}
            required
          />
        </div>
        <div className="field-block">
          <label className="field-label">Bairro</label>
          <input
            className="field"
            name="bairro"
            value={address.bairro}
            onChange={(event) => update('bairro', event.target.value)}
            required
          />
        </div>
        <div className="field-block">
          <label className="field-label">Complemento (opcional)</label>
          <input
            className="field"
            name="complemento"
            value={address.complemento}
            onChange={(event) => update('complemento', event.target.value)}
          />
        </div>
        <div className="field-block">
          <label className="field-label">Cidade</label>
          <input
            className="field"
            name="cidade"
            value={address.cidade}
            onChange={(event) => update('cidade', event.target.value)}
            required
          />
        </div>
        <div className="field-block">
          <label className="field-label">Estado</label>
          <input
            className="field"
            name="estado"
            value={address.estado}
            onChange={(event) => update('estado', event.target.value)}
            required
          />
        </div>
      </div>
      <p className="address-status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
