var model;

async function loadModel() {
    model = await tf.loadGraphModel('TFjs/model.json');
}

function predictImage() {
    // console.log("Processing...");

    // load image
    let image = cv.imread(canvas);

    //convert RGB to black&white image
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);

    // increase contrast
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);
    
    // find the contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    
    // get bounding rectangle
    let cnt = contours.get(0);
    let rect = cv.boundingRect(cnt);
    
    //crop image using bounding rectangle
    image = image.roi(rect);

    //work out dsize
    var height = image.rows;
    var width = image.cols;
    var scaleFactor;

    if (height >= width) {
        scaleFactor = height / 20;
        width = Math.round(width / scaleFactor);
        height = 20;
    } else {
        scaleFactor = width / 20;
        height = Math.round(height / scaleFactor);
        width = 20;
    }
    let dsize = new cv.Size(width, height);
    //resize the image
    cv.resize(image, image, dsize, 0, 0, cv.INTER_AREA);

    const LEFT = Math.ceil(4 + (20 - width)/2);
    const RIGHT = Math.floor(4 + (20 - width)/2);
    const TOP = Math.ceil(4 + (20 - height)/2);
    const BOTTOM = Math.floor(4 + (20 - height)/2);
    // console.log(`top: ${TOP}, bottom: ${BOTTOM}, left: ${LEFT}, right: ${RIGHT}`);
    const BLACK = new cv.Scalar(0, 0, 0, 0);
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    // Center of Mass
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0)
    const Moments = cv.moments(cnt, false);
    const cx = Moments.m10 / Moments.m00
    const cy = Moments.m01 / Moments.m00
    // console.log(`m00: ${Moments.m00}, cx: ${cx}, cy: ${cy}`);

    // Shift the image to the centroid
    const X_SHIFT = Math.round(image.cols/2.0 - cx);
    const Y_SHIFT = Math.round(image.rows/2.0 - cy);
    let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    dsize = new cv.Size(image.rows, image.cols);
    cv.warpAffine(image, image, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    // Normalized the Pixel Values 
    let pixelValues = image.data;
    // console.log(`pixel values: ${pixelValues}`);
    pixelValues = Float32Array.from(pixelValues);
    pixelValues = pixelValues.map(function (item) {
        return item / 255.0;
    })
    // console.log(`scale array: ${pixelValues}`);

    // Create tensor
    const X = tf.tensor([pixelValues]);
    // console.log(`Shape of Tensor: ${X.shape}`);
    // console.log(`dtype of Tensor: ${X.dtype}`);
    
    // Make prediction
    const result = model.predict(X);
    result.print();

    const output = result.dataSync()[0];
    // console.log(`dtype of result: ${result.dtype}`);
    // console.log(`Predicted figure is: ${result.shape}`);
    
    // console.log(tf.memory());
    
    //Testing only
    // const outputCanvas = document.createElement('CANVAS');
    // cv.imshow(outputCanvas, image);
    // document.body.appendChild(outputCanvas);

    // Clearup
    image.delete();
    contours.delete();
    hierarchy.delete();
    cnt.delete();
    M.delete();
    X.dispose();
    result.dispose();

    return output;

}