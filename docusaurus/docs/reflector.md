---
slug: reflector
title: mDNS Reflector Service
---

The mDNS reflector service forwards mDNS packets between subnets. It listens to mDNS queries and answers and rebroadcast them on the available subnets.

# Operation
The mDNS reflector services contains three componets:
 1. mDNS packet listener
 2. mDNS packet decoder
 3. mDNS packet forwarder

The mDNS packet listener captures UDP data packets embedded in IP4 or IP6 packets. The UDP data packets are subsequently decoded in order to retrieve the queries and answers fields. Finally the packet is forwarded to all available subnets. The main reasoning for forwarding the mDNS packet is that when a device broadcast its address, the mDNS packet doesn't cross its allocated subnet (see [RFC6762](https://datatracker.ietf.org/doc/html/rfc6762)).