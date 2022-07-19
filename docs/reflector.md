---
slug: reflector
title: mDNS Reflector Service
---

The mDNS reflector service forwards mDNS packets between subnets. It listens to mDNS queries and answers and rebroadcasts them on the available subnets.

# Operation
The mDNS reflector services contains three componets:
 1. mDNS packet listener
 2. mDNS packet decoder
 3. mDNS packet forwarder

The mDNS packet listener captures UDP data packets embedded in IP4 or IP6 packets. The UDP data packets are subsequently decoded in order to retrieve the queries and answers fields. The broadcasted/quiered mDNS adresses and the corresponding IP4/IP6 addresses are stored in memory. These addresses are later used for bridge connections between devices across subnets. Finally, the mDNS packet is forwarded to all available subnets. The main reasoning for forwarding the mDNS packet is that when a device broadcast its address, the mDNS packet doesn't cross its allocated subnet (see [RFC6762](https://datatracker.ietf.org/doc/html/rfc6762)).

The options `mdnsReflectIp4` and `mdnsReflectIp6` from `config.ini` if set to `true` will configure the mDNS service to forward mDNS IP4 and IP6 packets, respectively. The options `mdnsFilter = "src net 10.0 and dst net 10.0"` set the filter for the mDNS capture to intercept only packets that correspond only to the subnet activity, i.e., inter-device communication.

The mDNS reflector service will automatically create a bridge between two devices across two different subnets, if the following conditions are met:
 - At least one device in the bridge broadcasted its mDNS address,
 - At least one device in the bridge whishes to connect to the IP address that corresponds to the broadcasted mDNS adrress.


# Example

There are two devices `A` and `B` connected to the router network. Device `A` is located in subnet 2 and device `B` is located in subnet 5 (see figure below).

![Device A & B](/img/reflector-ab.svg)

The device `A` is broadcasting its mDNS address `devicea.local`. However, due to the fact the the mDNS packets are only received by the devices in the same subnet as device `A`, device `B` will not be able to infer the corresponding IP address of `devicea.local`. When the router detects that the device `A` wants to broadcast its address it will forward the correspoding packets to all avaiable subnets (see figure below).

![Broadcast](/img/reflector-broadcast.svg)

As a result, device `B` will infer that the IP4 address of `devicea.local` is `10.0.2.34`. Subsequently, if device `B` wants to connect to device `A`, the mDNS reflector will create a bridge between `A` and `B` (see figure below).

![Bridge](/img/reflector-bridge.svg)