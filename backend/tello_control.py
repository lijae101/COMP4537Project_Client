import socket

TELLO_IP = '192.168.10.1'
TELLO_PORT = 8889
TELLO_ADDRESS = (TELLO_IP, TELLO_PORT)

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('', 9000))

# Send init commands
sock.sendto(b'command', TELLO_ADDRESS)

def send_command(cmd):
    print(f"Sending: {cmd}")
    sock.sendto(cmd.encode(), TELLO_ADDRESS)
