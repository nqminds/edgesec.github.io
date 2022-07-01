---
slug: management
title: Network Management
---

The network management has the task of creating the mapping between subnets and VLANs, and creating the configuration for the software WIFI access point and the DHCP server.

The network management comprises the following services:

- Subnet service
- RADIUS server
- WIFI Software access point (AP) service
- DHCP service

## The Subnet service

This service creates subnets and maps VLAN IDs to a subnet IP range. It uses the Netlink protocol library suite to access network kernel functionality from the user space to setuo network interfaces. In order to use the Netlink library the user has to enable `USE_NETLINK_SERVICE`. If the Netlink library is not available the user can chose `USE_GENERIC_IP_SERVICE`, which uses the `ip` command to configure the network interfaces. Alternatively, on OpenWRT systems the user can enable `USE_UCI_SERVICE`, which uses the `uci` API to manage the settings for network, firewal, dhcp, etc.

The subnet configuration is given in `config.ini` as follows:
```ini
[interfaces]
bridgePrefix = "br"
interfacePrefix = "br"
if0 = "0,10.0.0.1,10.0.0.255,255.255.255.0"
if1 = "1,10.0.1.1,10.0.1.255,255.255.255.0"
if2 = "2,10.0.2.1,10.0.2.255,255.255.255.0"
if3 = "3,10.0.3.1,10.0.3.255,255.255.255.0"
if4 = "4,10.0.4.1,10.0.4.255,255.255.255.0"
if5 = "5,10.0.5.1,10.0.5.255,255.255.255.0"
if6 = "6,10.0.6.1,10.0.6.255,255.255.255.0"
if7 = "7,10.0.7.1,10.0.7.255,255.255.255.0"
if8 = "8,10.0.8.1,10.0.8.255,255.255.255.0"
if9 = "9,10.0.9.1,10.0.9.255,255.255.255.0"
if10 = "10,10.0.10.1,10.0.10.255,255.255.255.0"
```
where `bridgePrefix` parameter is used on OpenWRT systems to define the bridge prefix, `interfacePrefix` is the prefix for the interface name that corresponds to a VLAN. For instance for VLAN 2 and `interfacePrefix = "br"` the corresponding interface will be `br2`.

`ifn` key enumerates parameters for each interface that will be created by the subnet service, where all parameters are separated by commas. The first parameter is the VLAN ID, the second parameter is the gateway IP, the third parameter is the broadcast IP and the fourth parameter is the netmask. For instance given `if8 = "8,10.0.8.1,10.0.8.255,255.255.255.0"` and `interfacePrefix = "br"` the created interface `br8` has the following parameters:
```console
$ ip a show dev br8
13: br8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether ea:99:c5:cb:ee:c2 brd ff:ff:ff:ff:ff:ff
    inet 10.0.8.1/24 brd 10.0.8.255 scope global br8
       valid_lft forever preferred_lft forever
    inet 169.254.240.164/16 brd 169.254.255.255 scope global noprefixroute br8
       valid_lft forever preferred_lft forever
    inet6 fe80::6913:be7d:9634:8360/64 scope link 
       valid_lft forever preferred_lft forever
    inet6 fe80::e899:c5ff:fecb:eec2/64 scope link 
       valid_lft forever preferred_lft forever
```

## The RADIUS server

The RADIUS server has the role of authorising devices that want to connect to software AP. The server uses the RADIUS protocol ([RFC2865](https://datatracker.ietf.org/doc/html/rfc2865)) to send access request with specific VLAN configuration or acess reject. For instance when a device with the MAC address `11:22:33:44:55:66` wants to connect to the sofware WIFI AP the radius server will return `Access-Accept` code with the corresponding VLAN attribute. Subsequently the software AP will assign to the device with the MAC `11:22:33:44:55:66` the interface that has the cooresponding VLAN given by the `Access-Accept` status code attribute.

The `config.ini` parameters for the RADIUS server are as follows:
```ini
[radius]
port = 1812
clientIP = "127.0.0.1"
clientMask = 32
serverIP = "127.0.0.1"
serverMask = 32
secret = "radius"
```
where `port` is the UDP port for the RADIUS server, `clientIP` denotes the IP of the client (in our case it is the software AP) that will connect to the RADIUS server, `clientMask` is the netmask of the client, `serverIP` denotes the IP of the RADIUS server to which it binds to and `secret` is the parameter used to encrypt the communication between the client and RADIUS server.


## Software AP

The network management also has the role of creating the configuration for the WIFI software AP. The role of the AP is to create a WIFI communication channel between devices and the router. `edgesec` uses [hostapd](https://w1.fi/hostapd/) is its default software AP.

The `config.ini` parameters for the sofware AP are as follows:
```ini
[ap]
apBinPath = "./hostapd"
apFilePath = "/tmp/hostapd.conf"
apLogPath = "/tmp/hostapd.log"
interface = "wlan0"
device = "radio1"
vlanTaggedInterface = ""
ssid = "IOTH_TEST"
wpaPassphrase = "1234554321"
driver = "nl80211"
hwMode = "g"
channel = 11
wmmEnabled = 1
authAlgs = 1
wpa = 2
wpaKeyMgmt = "WPA-PSK"
rsnPairwise = "CCMP"
ctrlInterface = "/var/run/hostapd"
macaddrAcl = 2
dynamicVlan = 1
vlanFile = "/tmp/hostapd.vlan"
loggerStdout = -1
loggerStdoutLevel = 0
loggerSyslog = -1
loggerSyslogLevel = 0
ignoreBroadcastSsid = 0
wpaPskRadius = 2
```
where `apBinPath` is the absolute path to `hostapd` binary, `apFilePath` is the absolute path to the generated `hostapd` configuration file, `apLogPath` is the absolute path to the `hostapd` log file and `interface` is the parameter correspoding to the interface assigned for the WIFI modem. For OpenWRT systems `apBinPath=/sbin/wifi` points to the WIFI configuration script and `device = "radio1"` is the parameter denoting the index of the radio used to configure the WIFI modem. The name of the WIFI AP is given by the paremeter `ssid`. If `generateSsid` from `config.ini` is set ot `true`, the `ssid` parameter will be assign to the hostname of the router. The default encryption key for the WIFI is given by the parameter `wpaPassphrase`. This encryption key will be shared by all connected WIFI devices, if the RADIUS server doesn't assign a different encryption key for a specific device.


All the remaining parameters `vlanTaggedInterface`, `hwMode`, `channel`, `wmmEnabled`, `authAlgs`, `wpa`, `wpaKeyMgmt`, `rsnPairwise`, `ctrlInterface`, `macaddrAcl`, `dynamicVlan`, `vlanFile`, `loggerStdout`, `loggerStdoutLevel`, `loggerSyslog `, `loggerSyslogLevel`, `ignoreBroadcastSsid` and  `wpaPskRadius` are similar to the ones defined for [hostapd.conf](https://w1.fi/cgit/hostap/plain/hostapd/hostapd.conf).
