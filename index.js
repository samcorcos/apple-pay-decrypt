const x509 = require('x509')
const crypto = require('crypto')
const forge = require('node-forge')
const ECKey = require('ec-key')

const MERCHANT_ID_FIELD_OID = '1.2.840.113635.100.6.32'

class PaymentToken {
  constructor (tokenAttrs) {
    this.ephemeralPublicKey = tokenAttrs.header.ephemeralPublicKey
    this.ciphertext = tokenAttrs.data
  }

  decrypt (certPem, privatePem) {
    const sharedSecret = this.sharedSecret(privatePem)
    const merchantId = this.merchantId(certPem)
    const symmetricKey = this.symmetricKey(merchantId, sharedSecret)
    const decrypted = this.decryptCiphertext(symmetricKey, this.ciphertext)
    return JSON.parse(decrypted.slice(0, -15))
  }

  sharedSecret (privatePem) {
    const prv = new ECKey(privatePem, 'pem')
    const publicEc = new ECKey(this.ephemeralPublicKey, 'spki')
    return prv.computeSecret(publicEc).toString('hex')
  }

  merchantId (cert) {
    try {
      const info = x509.parseCert(cert)
      return info.extensions[MERCHANT_ID_FIELD_OID].split('@')[1]
    } catch (e) {
      console.error('Unable to extract merchant ID from certificate', e)
    }
  }

  symmetricKey (merchantId, sharedSecret) {
    const KDF_ALGORITHM = '\x0did-aes256-GCM'
    const KDF_PARTY_V = (Buffer.from(merchantId).toString('hex')).toString('binary')
    const KDF_INFO = KDF_ALGORITHM + 'Apple' + KDF_PARTY_V

    let hash = crypto.createHash('sha256')
    hash.update(Buffer.from('000000').toString('hex'))
    hash.update(Buffer.from('01').toString('hex'))
    hash.update(Buffer.from(sharedSecret).toString('hex'))
    hash.update(KDF_INFO, 'binary')

    return hash.digest('hex')
  }

  decryptCiphertext (symmetricKey, ciphertext) {
    const SYMMETRIC_KEY = forge.util.createBuffer((Buffer.from(symmetricKey).toString('hex')).toString('binary'))
    const IV = forge.util.createBuffer((Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toString('binary'))
    const CIPHERTEXT = forge.util.createBuffer(forge.util.decode64(ciphertext))

    let decipher = forge.cipher.createDecipher('AES-GCM', SYMMETRIC_KEY)
    const tag = forge.util.decode64('')

    decipher.start({
      iv: IV,
      tagLength: 0,
      tag
    })

    decipher.update(CIPHERTEXT)
    decipher.finish()
    return Buffer.from(decipher.output.toHex()).toString('hex').toString('utf-8')
  }
}

module.exports = PaymentToken
