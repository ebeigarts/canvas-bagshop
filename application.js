var Image = (function() {
  function Image(image, size) {
    this.image = image;
    this.size = size;
    this.width = image.width / this.size;
    this.height = image.height;
    // console.log(this.image, this.size, this.width, this.height);
    this.canvas = document.createElement('canvas');
    this.canvas.width  = this.image.width * this.size;
    this.canvas.height = this.image.height;
    this.image.parentNode.insertBefore(this.canvas, this.image);

    // get 2d context
    this.context = this.canvas.getContext('2d');

    // draw the image on the canvas
    this.context.drawImage(this.image, 0, 0);

    // Get the image with the masks.
    this.imageData = this.context.getImageData(0, 0, this.width, this.height);

    // Get masks data
    this.masks = [];
    for (var i = 1; i < this.size; ++i) {
      this.masks.push(
        this.context.getImageData(this.width * i, 0, this.width, this.height).data
      );
    }

    // Resize the image and hide the masks
    this.canvas.width = this.width;

    this.draw();

    // Remove the original image
    this.image.parentNode.removeChild(this.image);
  }

  Image.prototype.draw = function() {
    // Draw the result on the canvas
    this.context.putImageData(this.imageData, 0, 0);
  }

  Image.prototype.resetColors = function() {
    // Use the identity matrix while clearing the canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.draw();
  }

  Image.prototype.applyColors = function(colors) {
    this.resetColors();

    for (var i = 0; i < this.masks.length; ++i) {
      this.applyColor(this.masks[i], colors[i]);
    }
  }

  Image.prototype.applyColor = function(mask, color) {
    var maskCanvas = document.createElement('canvas');
    var maskContext = maskCanvas.getContext("2d");

    maskCanvas.width  = this.canvas.width;
    maskCanvas.height = this.canvas.height;

    maskContext.drawImage(this.image, 0, 0);

    var maskData = maskContext.getImageData(0, 0, this.width, this.height);
    var pix = maskData.data;
    var alpha;

    for (var i = 0, n = pix.length; i < n; i += 4) {
      alpha = mask[i+3];
      if (alpha > 0) {
        pix[i  ] = this.multiplyPixels(color[0], pix[i  ]); // red
        pix[i+1] = this.multiplyPixels(color[1], pix[i+1]); // green
        pix[i+2] = this.multiplyPixels(color[2], pix[i+2]); // blue
        pix[i+3] = alpha
      } else {
        pix[i  ] = 255
        pix[i+1] = 255
        pix[i+2] = 255
        pix[i+3] = 0
      }
    }
    maskContext.putImageData(maskData, 0, 0);
    this.context.drawImage(maskCanvas, 0, 0)
  }

  Image.prototype.multiplyPixels = function(topValue, bottomValue) {
    return topValue * bottomValue / 255;
  }

  return Image;
})();
