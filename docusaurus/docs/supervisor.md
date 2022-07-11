---
slug: supervisor
title: Supervisor Service
---

The supervisor service is the API on top of the network management service. It allows creating bridges, assigning NAT access to devices and gives access to the crypt service by providing basic cryptographic functionalities for a user/device. The supervisor service can be accessed using a UDP or a UNIX domain connection by configurig the following parameters from `config.ini`:

```ini
[supervisor]
supervisorControlPort = 32001
supervisorControlPath = "/tmp/edgesec-control-server"
```

where `supervisorControlPort` sets the UDP port and `supervisorControlPath` sets the absolute path to the UNIX domain socket. For instance by using the `netcat` utility one can send the `GET_MAP 11:22:33:44:55:66` command to the supervisor's UNIX domain socket located at `/tmp/edgesec-control-server` as follows:

```bash
echo -n "GET_MAP 11:22:33:44:55:66" | nc -uU /tmp/edgesec-control-server -w2 -W1.
```

The command and the parameters are delimited by spaces. The reply of a supervisor command can be `OK`, `FAIL` or command specific output. Every command reply is newline delimited.

The supervisor service implements the followig sets of commands:

```c
// System commands
#define CMD_PING "PING_SUPERVISOR"
#define CMD_SET_IP "SET_IP"
#define CMD_SUBSCRIBE_EVENTS "SUBSCRIBE_EVENTS"

// Network management commands
#define CMD_ACCEPT_MAC "ACCEPT_MAC"
#define CMD_DENY_MAC "DENY_MAC"
#define CMD_ADD_NAT "ADD_NAT"
#define CMD_REMOVE_NAT "REMOVE_NAT"
#define CMD_ASSIGN_PSK "ASSIGN_PSK"
#define CMD_GET_MAP "GET_MAP"
#define CMD_GET_ALL "GET_ALL"
#define CMD_ADD_BRIDGE "ADD_BRIDGE"
#define CMD_REMOVE_BRIDGE "REMOVE_BRIDGE"
#define CMD_CLEAR_BRIDGES "CLEAR_BRIDGE"
#define CMD_GET_BRIDGES "GET_BRIDGES"
#define CMD_REGISTER_TICKET "REGISTER_TICKET"
#define CMD_CLEAR_PSK "CLEAR_PSK"

// Cryptographic commands
#ifdef WITH_CRYPTO_SERVICE
#define CMD_PUT_CRYPT "PUT_CRYPT"
#define CMD_GET_CRYPT "GET_CRYPT"
#define CMD_GEN_RANDKEY "GEN_RANDKEY"
#define CMD_GEN_PRIVKEY "GEN_PRIVKEY"
#define CMD_GEN_PUBKEY "GEN_PUBKEY"
#define CMD_GEN_CERT "GEN_CERT"
#define CMD_ENCRYPT_BLOB "ENCRYPT_BLOB"
#define CMD_DECRYPT_BLOB "DECRYPT_BLOB"
#define CMD_SIGN_BLOB "SIGN_BLOB"
#endif
```

## PING_SUPERVISOR command

Pings the supervisor.

Usage:

```
PING_SUPERVISOR
```

Output: `PONG`

## SET_IP command

Sets the IP for a given MAC address. This command is used only by the DHCP service.

Usage:

```
SET_IP mac_address ip_address type
```

where `type` is the can be `add` - if a new IP address is allocated, `old` - if an old IP address is reused, `del` - if an IP is deallocated for the give MAC address and `arp` - if it is an arp request from the DHCP server.

Output: `OK` - on success, `FAIL` - on failure.

## SUBSCRIBE_EVENTS command

Subscribe a supervisor connection client (connection created using UDP or UNIX domain socket) to IP or AP events.

Usage:

```
SUBSCRIBE_EVENTS
```

Output: `OK` - on success, `FAIL` - on failure.

When a device receives an IP address or when it connects/disconnect from the WIFI AP, the supervisor will send the corresponding event to the connection client.

## ACCEPT_MAC command

Adds a MAC address together with a VLAN ID to the accept list. When device connects to the WIFI AP, the RADIUS server will use the accept list to allocate a VLAN to the connecting device.

Usage:

```
ACCEPT_MAC mac_address vlanid
```

Output: `OK` - on success, `FAIL` - on failure.

## DENY_MAC command

Removes a MAC address from the accept list.

Usage:

```
DENY_MAC mac_address
```

Output: `OK` - on success, `FAIL` - on failure.

## ADD_NAT command

Adds internet access to a device.

Usage:

```
ADD_NAT mac_address
```

Output: `OK` - on success, `FAIL` - on failure.

## REMOVE_NAT command

Removes internet access from a device.

Usage:

```
REMOVE_NAT mac_address
```

Output: `OK` - on success, `FAIL` - on failure.

## ASSIGN_PSK command

Assigns a WIFI password to a device.

Usage:

```
ASSIGN_PSK mac_address wifi_password
```

Output: `OK` - on success, `FAIL` - on failure.

## GET_MAP command

Returns the connection details for a device.

Usage:

```
GET_MAP mac_address
```

where `mac_address` is the MAC address.

Output: on success it returns a string with the following format

```
allowed, mac, primary, secondary, vlanid, nat, label, id, len, timestamp, status
```

where `allowed` is `a` for accept or `d` for denied, `mac` is the MAC address, `primary` is the primary allocated IP address, `secondary` is the secondary allocated IP address, `vlanid` is the allocated VLAN ID, `nat` is the internet access flag for the device, `label` is the assigned label for the devices, `len` is the WIFI password length, `timestamp` is the timestamp (64 bit) when the devices joined the WIFI AP and `status` is the connection status (`1` for connected and `2` for disconnected). The command returns `FAIL` on failure.

## GET_ALL command

Similar to `GET_MAP` command except that it sends the connection details for all devices.
Usage:

```
GET_ALL
```

Output: on success it returns a list of newline delimited strings with the same format as in the `GET_MAP` command. The command returns `FAIL` on failure.

## ADD_BRIDGE command

Adds a bridge between two devices.

Usage:

```
ADD_BRIDGE src dst
```

where `src` is the MAC address for the source and `dst` is the MAC address for the destination.

Output: `OK` - on success, `FAIL` - on failure.

## REMOVE_BRIDGE command

Removes a bridge between two devices.

Usage:

```
REMOVE_BRIDGE src dst
```

where `src` is the MAC address for the source and `dst` is the MAC address for the destination.

Output: `OK` - on success, `FAIL` - on failure.

## CLEAR_BRIDGE command

Clears all the assigned bridges for a device.

Usage:

```
CLEAR_BRIDGE mac_address
```

where `mac_address` is the MAC address for the device.

Output: `OK` - on success, `FAIL` - on failure.

## GET_BRIDGES command

Returns all the assigned bridges.

Usage:

```
GET_BRIDGES
```

Output: a list of newline delimited strings with the format `src,dst`, where `src` is the source MAC address and `dst` is the destination MAC address. The command returns `FAIL` on failure.

## REGISTER_TICKET command

Registers a WIFI connection ticket for a given VLAN ID and returns a random WIFI password. A device wishing to connect to the WIFI AP can use the returned WIFI password. After connecting to the WIFI AP the device will be assigned the VLAN ID of the ticket. The ticket is valid for 60 seconds after which it is removed.

Usage:

```
REGISTER_TICKET label vlanid
```

where `label` is the assigned label for the connecting devices and `vlanid` is the assigned VLAN ID.

Output: the randomly generated WIFI password, `FAIL` - on failure.

## CLEAR_PSK command

Clears the WIFI password for a device.

Usage:

```
CLEAR_PSK mac_address
```

where `mac_address` is the MAC address.

Output: `OK` - on success, `FAIL` - on failure.

## PUT_CRYPT command

Insert a key/value pair into the crypt store.

Usage:

```
PUT_CRYPT keyid value
```

where `keyid` is the key ID and `value` is th value encoded as url base64.

Output: `OK` - on success, `FAIL` - on failure.

## GET_CRYPT command

Return a value for a given key from the crypt store.

Usage:

```
GET_CRYPT keyid
```

where `keyid` is the key ID.

Output: the returned value encoded as url base64, `FAIL` - on failure.

## GEN_RANDKEY command

Generate a a random key of given size and store it in the crypt store.

Usage:

```
GET_CRYPT keyid, size
```

where `keyid` is the key ID and `size` is the size in bytes.

Output: `OK` - on success, `FAIL` - on failure.

## GEN_PRIVKEY command

Generate an elliptic curve private key of a given size and store it in the crypt store.

Usage:

```
GEN_PRIVKEY keyid, size
```

where `keyid` is the key ID and `size` is the size in bytes.

Output: `OK` - on success, `FAIL` - on failure.

## GEN_PUBKEY command

Generate an elliptic curve public key from a private key and store it in the crypt store.

Usage:

```
GEN_PUBKEY pubkeyid, privkeyid
```

where `pubkeyid` is the public key ID and `privkeyid` is the private key ID, which is already present in the crypt store.

Output: `OK` - on success, `FAIL` - on failure.

## GEN_CERT command

Generate a certificate based on a private key and store it in the crypt store.

Usage:

```
GEN_PUBKEY certid, privkeyid, common_name
```

where `certid` is the certificate ID, `privkeyid` is the private key ID, which is already present in the crypt store and `common_name` is the common name assigned for the certificate.

Output: `OK` - on success, `FAIL` - on failure.

## ENCRYPT_BLOB command

Encrypt a blob of data using a stored private key and initial value.

Usage:

```
ENCRYPT_BLOB privkeyid, ivid, blob
```

where `privkeyid` is the stored private key ID, `ivid` is the stored initial value ID and `blob` is the url base64 encoded blob of data.

Output: the encrypted url base64 encoded blob, `FAIL` - on failure.

## DECRYPT_BLOB command

Dencrypt a blob of data using a stored private key and initial value.

Usage:

```
DECRYPT_BLOB privkeyid, ivid, blob
```

where `privkeyid` is the stored private key ID, `ivid` is the stored initial value ID and `blob` is the url base64 encoded blob of data.

Output: the decrypted url base64 encoded blob, `FAIL` - on failure.

## SIGN_BLOB command

Sign a blob of data using a stored private key.

Usage:

```
SIGN_BLOB privkeyid, blob
```

where `privkeyid` is the stored private key ID and `blob` is the url base64 encoded blob of data.

Output: the returned signature as url base64 encoded data, `FAIL` - on failure.
