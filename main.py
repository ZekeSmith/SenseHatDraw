from http.server import SimpleHTTPRequestHandler, HTTPServer
import math
from sense_emu import SenseHat
import json

# Set sense hat variable
sense = SenseHat()

# setup api routes for webserver
post_routes = ["/api/set-pixels", "/api/clear"]

sense.low_light = True

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if not self.path in post_routes:
            return

        if self.path == '/api/clear':
            sense.clear()
            return

        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        for d in data:
            x = d['x']
            y = d['y']

            color = d['color']
            sense.set_pixel(x, y, (int(color['r']), int(color['g']), int(color['b'])))

        self.send_response(200)
        self.wfile.write(bytes("OK", "utf-8"))

httpd = HTTPServer(('0.0.0.0', 8000), Handler)
try:
    httpd.serve_forever()

except KeyboardInterrupt:
    pass

sense.clear()
sense.low_light = False
httpd.server_close()

