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
The command and the parameters are delimited by spaces. The reply of a supervisor command can be `OK`, `FAIL` or command specific output.

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

Returns the connection details for all device.

Usage:
```
GET_MAP
```

Output: on success it returns a new line delimited strings with the following format
```
allowed, mac, primary, secondary, vlanid, nat, label, id, len, timestamp, status
```
where `allowed` is `a` for accept or `d` for denied, `mac` is the MAC address, `primary` is the primary allocated IP address, `secondary` is the secondary allocated IP address, `vlanid` is the allocated VLAN ID, `nat` is the internet access flag for the device, `label` is the assigned label for the devices, `len` is the WIFI password length, `timestamp` is the timestamp (64 bit) when the devices joined the WIFI AP and `status` is the connection status (`1` for connected and `2` for disconnected).

, `FAIL` - on failure.

## GET_ALL command
## ADD_BRIDGE command
## REMOVE_BRIDGE command
## CLEAR_BRIDGE command
## GET_BRIDGES command
## REGISTER_TICKET command
## CLEAR_PSK command
## PUT_CRYPT command
## GET_CRYPT command
## GEN_RANDKEY command
## GEN_PRIVKEY command
## GEN_PUBKEY command
## GEN_CERT command
## ENCRYPT_BLOB command
## DECRYPT_BLOB command
## SIGN_BLOB command


```
ACCEPT_MAC mac_address vlanid
```

### DENY_MAC

Usage:

```
DENY_MAC mac_address
```

### ADD_NAT

Usage:

```
ADD_NAT mac_address
```

### REMOVE_NAT

Usage:

```
REMOVE_NAT mac_address
```

### ASSIGN_PSK

Usage:

```
ASSIGN_PSK mac_address password
```

### GET_MAP

Usage:

```
GET_MAP mac_address
```

### GET_ALL

Usage:

```
GET_ALL
```

### ADD_BRIDGE

Usage:

```
ADD_BRIDGE mac_address_src mac_address_dst
```

### REMOVE_BRIDGE

Usage:

```
REMOVE_BRIDGE mac_address_src mac_address_dst
```

### CLEAR_BRIDGE

Usage:

```
CLEAR_BRIDGE mac_address
```

### GET_BRIDGES

Usage:

```
GET_BRIDGES
```

### REGISTER_TICKET

Usage:

```
REGISTER_TICKET mac_address device_label vlanid
```

### CLEAR_PSK

Usage:

```
CLEAR_PSK mac_address
```

### PUT_CRYPT

Usage:

```
PUT_CRYPT key_id value[base64]
```

### GET_CRYPT

Usage:

```
GET_CRYPT key_id
```

### GEN_RANDKEY

Usage:

```
GEN_RANDKEY key_id key_size[bytes]
```

### GEN_PRIVKEY

Usage:

```
GEN_PRIVKEY key_id key_size[bytes]
```

### GEN_PUBKEY

Usage:

```
GEN_PUBKEY public_key_id private_key_id
```

### GEN_CERT

Usage:

```
GEN_CERT certificate_kid private_key_id common_name
```

### ENCRYPT_BLOB

Usage:

```
ENCRYPT_BLOB key_id iv_id blob[base64]
```

### DECRYPT_BLOB

Usage:

```
DECRYPT_BLOB key_id iv_id blob[base64]
```

### SIGN_BLOB

Usage:

```
SIGN_BLOB key_id blob[base64]
```

