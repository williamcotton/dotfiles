#!/usr/bin/env python3

import sys
from flask import Flask, request
import threading
import pika
import uuid

LINE_SEPARATOR = " "

app = Flask(__name__)

class RpcClient(object):
    """Asynchronous Rpc client."""
    internal_lock = threading.Lock()
    queue = {}

    def __init__(self):
        """Set up the basic connection, and start a new thread for processing.

            1) Setup the pika connection, channel and queue.
            2) Start a new daemon thread.
        """
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host="localhost")
        )
        self.channel = self.connection.channel()
        result = self.channel.queue_declare(queue="", exclusive=True)
        self.callback_queue = result.method.queue
        thread = threading.Thread(target=self._process_data_events)
        thread.setDaemon(True)
        thread.start()

    def _process_data_events(self):
        """Check for incoming data events.

        We do this on a thread to allow the flask instance to send
        asynchronous requests.

        It is important that we lock the thread each time we check for events.
        """


        def on_response(ch, method, props, body):
            """On response we simply store the result in a local dictionary."""
            self.queue[props.correlation_id] = body


        self.channel.basic_consume(on_message_callback=on_response, auto_ack=True,
                                   queue=self.callback_queue)
        while True:
            with self.internal_lock:
                self.connection.process_data_events()
                pass

    def send_request(self, payload, path):
        """Send an asynchronous Rpc request.

        The main difference from the rpc example available on rabbitmq.com
        is that we do not wait for the response here. Instead we let the
        function calling this request handle that.

            corr_id = rpc_client.send_request(payload)

            while rpc_client.queue[corr_id] is None:
                sleep(0.1)

            return rpc_client.queue[corr_id]

        If this is a web application it is usually best to implement a
        timeout. To make sure that the client wont be stuck trying
        to load the call indefinitely.

        We return the correlation id that the client then use to look for
        responses.
        """
        corr_id = str(uuid.uuid4())
        self.queue[corr_id] = None
        with self.internal_lock:
            self.channel.basic_publish(exchange='',
                                       routing_key=path,
                                       properties=pika.BasicProperties(
                                           reply_to=self.callback_queue,
                                           correlation_id=corr_id,
                                       ),
                                       body=payload)
        return corr_id


# Define a route to handle all incoming requests
@app.route(
    "/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "PATCH"]
)
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
def handle_request(path):
    # Build up the raw HTTP request
    raw_request = request.method + " " + request.path + " HTTP/1.1\r\n"
    for key, value in request.headers.items():
        raw_request += key + ": " + value + "\r\n"
    raw_request += "\r\n" + request.get_data(as_text=True)

    corr_id = rpc_client.send_request(raw_request, request.path)

    while rpc_client.queue[corr_id] is None:
        pass

    return rpc_client.queue[corr_id]


if __name__ == "__main__":
    # Get the port number from the command line arguments
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000

    rpc_client = RpcClient()

    # Start the Flask server
    app.run(port=port, threaded=True)
