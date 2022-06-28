---
slug: crypt
title: Crypt Service
---

The crypt service service implements a key/value store for all other services to store and retrieve encrypted keys or data. To encrypt data the crypt service generates keys that are encrypted using the hardware secure element or a user supplied passphrase.

# Store DB
The crypt service is implemented as a sqlite database (the path is set by the `config.ini` parameter `cryptDbPath`), which contains two tables secrets and store.

The schema for the secrets table is as follows:
```sql
CREATE TABLE secrets (id TEXT NOT NULL, value TEXT, salt TEXT, iv TEXT, PRIMARY KEY (id));
```
where `id` is the ID of the generated key, `value` is the value of the key, `iv` the initial value (IV) used to encrypt and decrypt the key and `salt` is the salt parameter.

An example of the secrets table row is given below:

|ID|VALUE|SALT|IV|
|--|-----|----|--|
|master|LbknNO6o+s+u1b4wg9eGzQjHCanicVtDlDJBWZ0u4VaV25oIUCt1b5bthzLwhQO0|Z95m5G/+jgb3ga0dufa//w|hka2MmSUkJUJBf7TQMYnug|
|rest|a2UiZR/DLYb3hX61ZQ7Mb/vdVVIchJzkuNnoIhLDCHXe9453IlWjOfOymodUZIsq|RLdlnafYj7279lne7A5UoA|lgTKNxgxbeCxg4VySS/7vw|
|94:b9:7e:15:47:95|lPVf5wqMnb9+8Q8Cik5oetOI9MfA6qjPm1tKTR3WGPWgZYtaybEeDKWGX/x4EUUB|gFvI5tfeHANOafJlFsHXpg|mH2yeX/FEvJd1ilg25Zwcg|

The `value`, `salt` and `iv` are base64 encoded.

When a user or service wants to store a key/value she will need to provide and ID for the key that will be used to encrypt/decrypt the user's value. If such an ID does not exists in the secrets table, the service will randomly generate one and encrypt it using the hardware secure element or the user supplied passphrase. When the user provides the passphrase the service will generate an encryption key using the `salt` and Password-Based Key Derivation Function Password-Based Key Derivation Function 2. The derived key is not stored on the device. If the user instead uses the hardware secure element, the key derivation, encryption and decryption is done in the secure memory.

Each key/value pair is stored in the store table with the following schema:
```sql
CREATE TABLE store (key TEXT NOT NULL, value TEXT, id TEXT, iv TEXT, PRIMARY KEY (key));
```
where `key` is the key for the value, `value` is the value to be stored, `id` is the key id used to encrypt/decrypt the value and `iv` is the IV used to encrypt/decrypt the value.

An example of the store table rows is given below.

|KEY|VALUE|ID|IV|
|---|-----|--|--|
|7815f8ce-57b8-49c8-9121-5b98986cbccd|GCM564Ugwyh0bW3f4JuFkw|master|Ja0pz9cdH7p3Q+BBP2MIrw|
|db07c38a-2842-4f45-9672-74d57ec99e63|23cHWe6r033czxopWsv6Ng|master|FU7hUGGbifro65cv0u0OwQ|
|1a35f54d-c5f9-4072-85b0-4b40f8fb4a14|LR3iRw6SrN/pWKSTJvNtrA|master|x9hFentG2Q6iynHXCk2ktA|
|831ffbb1-2e79-422a-bdad-e9e96a56d568|CdoxKK4PbDvWD9cOdRcTXQ|master|RHR1AGsjpWVHDR4VN2PiLA|

The `value` and `iv` are base64 encoded.

Each row of the store DB contains the `id` of the key that was used to encrypt/decrypt the `value`. The encryption algorithm used is AES 256 CBC.

# Secure element
In order to enable the use of secure element one needs to set the `USE_CRYPTO_SERVICE` and `USE_*_HSM` to `ON`. `USE_*_HSM` corresponds to a particular implementation of the secure element API.

In order to add an aditional implementation of a secure hardware element one can use the generic driver interface `generec_hsm_drive.h` as a temeplate. The generic drive interface defines the context:

```c
struct hsm_context {
  void *hsm_ctx;
};
```
that is passed to the init and encrypt/decrypt functions as follows:
```c
struct hsm_context *init_hsm(void);
int close_hsm(struct hsm_context *context);
int generate_hsm_key(struct hsm_context *context, uint8_t *key, size_t key_size);
int encrypt_hsm_blob(struct hsm_context *context, uint8_t *in, size_t in_size, uint8_t **out, size_t *out_size);
int decrypt_hsm_blob(struct hsm_context *context, uint8_t *in, size_t in_size, uint8_t **out, size_t *out_size);
```

The developer will have to provide a tailored implementation for the above functions in order to use a particular hardware secure element. An example is provided in `zymkey4_driver.h`.