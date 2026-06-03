#!/usr/bin/env python3
import struct
import zlib
import os

def create_png(width, height, color, text, filename):
    """Create a simple PNG with text"""
    def png_chunk(chunk_type, data):
        chunk_len = struct.pack('>I', len(data))
        chunk_crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk_len + chunk_type + data + chunk_crc
    
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = png_chunk(b'IHDR', ihdr_data)
    
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'
        for x in range(width):
            raw_data += bytes(color)
    
    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)
    
    iend = png_chunk(b'IEND', b'')
    
    with open(filename, 'wb') as f:
        f.write(signature + ihdr + idat + iend)

os.makedirs('images', exist_ok=True)

create_png(81, 81, (75, 85, 99), 'AI', 'images/ai.png')
create_png(81, 81, (30, 58, 138), 'AI', 'images/ai-active.png')
create_png(81, 81, (75, 85, 99), 'SVC', 'images/service.png')
create_png(81, 81, (30, 58, 138), 'SVC', 'images/service-active.png')

print("Icons created successfully!")
