# Apple Pay Decrypt

[![npm version](https://img.shields.io/npm/dt/apple-pay-decrypt.svg?style=flat-square)](https://img.shields.io/npm/dt/apple-pay-decrypt.svg)
[![npm version](https://img.shields.io/npm/v/apple-pay-decrypt.svg?style=flat-square)](https://www.npmjs.com/package/apple-pay-decrypt)

This package allows you to decrypt a token received from Apple Pay.

This works in `node` and not on a browser, as it requires the built-in `crypto` package and secret keys (`.pem` files), which should never exist on the client anyway.

The decryption methodology of this package is largely taken from the [Gala Ruby Gem](https://github.com/spreedly/gala).

## Getting Started

```sh
npm i --save apple-pay-decrypt
```

In order to decrypt the token, you will need two `.pem` files. One is a certificate and one is a key. The process for generating these is complicated.

If you get stuck, [this document](https://aaronmastsblog.com/blog/apple-pay-certificates/) might be helpful.

Run the following commands (largely taken from the article written by [@amast09](https://github.com/amast09)) to generate your keys:

```sh
openssl ecparam -out private.key -name prime256v1 -genkey
openssl req -new -sha256 -key private.key -nodes -out request.csr
```

Then go to the [Apple Developer Certificate Manager](https://developer.apple.com/account/ios/certificate/).

Make sure you have a Merchant Id. Navigate to `Identifiers` => `Merchant IDs` to make sure you have one, if not, create one.

Go to `Certificates` => `All`, then `+` in the top right. Select `Apple Pay Payment Processing Certificate`, go through to `Generate` and upload the `.csr` file you created (`request.csr`). Note that `.csr` is the same as `.certSigningRequest`.

Download the file, which will download as `apple_pay.cer`. You need that file to create the key.

```sh
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out temp.pem
openssl pkcs12 -export -out key.p12 -inkey private.key -in temp.pem
```

You will need to password protect your `.p12` file. Keep that password somewhere secure.

You now have the two files you need to decrypt Apple Pay tokens, but before you can do that, you need to convert them into `.pem` files.

Run the following commands to convert them to `.pem` files:

```sh
openssl x509 -inform DER -outform PEM -in apple_pay.cer -out certPem.pem
openssl pkcs12 -in key.p12 -out privatePem.pem -nocerts -nodes
```

After all that, you should have a certificate (`certPem.pem`) file that looks something like this:

```
-----BEGIN CERTIFICATE-----
MIIEfzCCBCagAwIBAgIIcDQ4Fbx2jWYwCgYIKoZIzj0EAwIwgYAxNDAyBgNVBAMM
K0FwcGxlIFdvcmxkd2lkZSBEZXZlbG9wZXIgUmVsYXRpb25zIENBIC0gRzIxJjAk
BgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApB
cHBsZSBJbmMuMQswCQYDVQQGEwJVUzAeFw0xOTAyMjMxNDU2NDFaFw0yMTAzMjQx
NDU2NDFaMIGxMTAwLgYKCZImiZPyLGQBAQwgbWVyY2hhbnQuY29tLmdyYXRpdHVk
ZS5ncmF0aXR1ZGUxRjBEBgNVBAMMPUFwcGxlIFBheSBQYXltZW50IFByb2Nlc3Np
iWlORp7+MRSeIt3sEdnWIhY29xvHSdXgMT6kpaUupattcKtlHnLiYlTJHRRCO20x
2thoxaQriM+gFSnAyzrdaOnVTJHRRCO20xxcarcjHFr9GHRVsoysRC/ThwAqMaTs
XEV5VwHqpLuvzOca/+A5Q1MEkhH4lgNrqs5AhKkI1WZv2AWErjxkXBehvZy5C51n
RNcJ4KOAHTePfdrkQ3YVcyMnTlz2QBT8K/uLkoG/H1U8nNfaxwA5m6FDLoVXatC2
oGI+ctCv5Ge2SsEPaUqJ7zE3BU4UsbRvwiXwbWW42YZ2V2wvASdTiXw3/nv7apD4
H+PXFQuC86CSKNKV58jFZZNQoTlU0K+0rBR63ps4bBonVg4Bp2EBntFu5Du/rXMo
U5qxOgbh3/ZNtUT52AQicdJ0c+IgVYP6sGhVGorxMS0lFQ67qaj6luRaqzVovcGl
wa7DzQxcl0HZh2M/Wj9v2d+oGjlINlD9SAlWA/dWXrQF6kzEMoOJKBakO1SRVwD2
9UMDoM5JUK+iBteSFp6iHB7wyfb8VMwzzU3aSWDC+zrsbGXgQsFJ9ZClMyu/aiWs
rbugF9EtKocCWbODlxbRBp310XkPVcOKamZ0UI8P3+AvuMeXdnrFzUUBZnXU8bWM
RuIiK0QZobngHsRO3J/oT1h9URFflg7MrvbAyHTBPv5bSztOPcxOEIfwd+opq6Bc
MXZ+0fErpK5YW7jcahrPRp63e3FZjiKrHWZPFXXOH3N30VKRMDsKbZepNWu4glVb
YwKcj8BAm4LvxkCLODZVIsqYZbNTzyTWbKiz7G53Rt6XqFaQVlqlSxvA97SUfq62
RNcJ4KOAHTePfdrkQ3YVcyMnTlz2QBT8K/uLkoG/H1U8nNfaxwA5m6FDLoVXatC2
8nG5lEs5hYJ2WG9Yo39m1gyCHeNse5sOrph9Dq7tro5mO+nX3XaVaIi3MHFl9Hq6
uMetisso8rg633J/YpJipiz6MOdpf7Q7LqX6M0i3x4BJZfIa3xZPsUoEYObyGTJI
OtAJHpvnTIoDhBApBiH/sDq97pzcsl4VkngxxEiTEjXYQEIhcVQpG6lU6rX9+ekQ
qDRXQRMETBev1j7Y1w/v2K0CIAlnnXPVX52g5FTadoFyVq2a91sA4ao44VabMaz8
W5k1
-----END CERTIFICATE-----
```

And a key (`privatePem.pem`) that looks something like this:

```
Bag Attributes
    localKeyID: 90 C8 20 E7 8A 2A E5 7E 33 06 FD C5 43 47 9F 15 2F DE 73 90 
Key Attributes: <No Attributes>
-----BEGIN PRIVATE KEY-----
8nG5lEs5hYJ2WG9Yo39m1gyCHeNse5sOrph9Dq7tro5mO+nX3XaVaIi3MHFl9Hq6
YwKcj8BAm4LvxkCLODZVIsqYZbNTzyTWbKiz7G53Rt6XqFaQVlqlSxvA97SUfq62
qDRXQRMETBev1j7Y1w/v2K0CIAlnnXPVX52g5FTadoFyVq2a91sA4ao4
-----END PRIVATE KEY-----
```

(And no, those are not my real keys)

## Usage

The `tokenFromApplePay` you get from Apple Pay will look something like this:

```js
{
    "version": "EC_v1",
    "data": "vxae4VFHqdtWakaJ1wqQHyel...<a lot more data>...ggVQsfUxBXR8=",
    "signature": "MIAGCSqGSIb3DQEHAqCA...<a lot more data>...MAAAAAAAA=",
    "header": {
        "ephemeralPublicKey": "MFkwEwYHKoZIzj0CAQYIKoZICZImiZPyLGQBAQwgbWVyY2hhbnQuY29tLmdy332d55suNAl1RIZi3KIT5hwmiSKSch9+6OOGlRZw0xOTAy4jejmO0A==",
        "publicKeyHash": "0aB0KxDCKoZICZImiZPyLGQBAQwoIwz3m6bKxuqPe+F6yQco=",
        "transactionId": "54829332dd6db37d06KoZICZImiZPyLGQBAQw5e6f35059acad43133d792fc139"
    }
}
```

To decrypt the token, import the `.pem` files and create a new `PaymentToken` with the token from Apple Pay. Then decrypt using the keys.

```js
const PaymentToken = require('apple-pay-decrypt')

const certPem = fs.readFileSync(path.join(__dirname, '../path/to/certPem.pem'), 'utf8')
const privatePem = fs.readFileSync(path.join(__dirname, '../path/to/privatePem.pem'), 'utf8')

const tokenFromApplePay = {...} // from Apple Pay

const token = new PaymentToken(tokenFromApplePay)

const decrypted = token.decrypt(certPem, privatePem)
```

The `decrypted` value at this point should look something like this:

```js
{
  applicationPrimaryAccountNumber: '17029283048730',
  applicationExpirationDate: '231231',
  currencyCode: '840',
  transactionAmount: 500,
  deviceManufacturerIdentifier: '544555544456',
  paymentDataType: '3DSecure',
  paymentData: {
    onlinePaymentCryptogram: 'IE0QTuXZlbG9wZXIgUmiQAQojEBhgA=' 
  } 
}
```

You can then use those decrypted values with your payment processor of choice (Stripe, Braintree, et al) to process payments from Apple Pay. 
