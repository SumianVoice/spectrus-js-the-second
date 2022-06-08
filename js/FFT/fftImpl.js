function rootsOfUnity(n) {
    let tmp = 2 * Math.PI / n;

    let roots = [];

    for (let k = 0; k < n; k++) {
        roots.push(Math.cos(tmp * k));
    }

    return roots;
}

let rootsOfUnityCache = {};

function cachedRootsOfUnity(n) {
    if (n in rootsOfUnityCache) {
        return rootsOfUnityCache[n];
    } else {
        rootsOfUnityCache[n] = rootsOfUnity(n);
        return rootsOfUnityCache[n];
    }
}

// https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm
function computeFFT(x, N=0, s=1) {
    if (N === 0) {
        N = x.length;
    }

    let X = new Float32Array(N);

    if (N === 1) {
        X[0] = x[0];
    } else {
        let roots = cachedRootsOfUnity(N);

        let N2 = N / 2;

        let left  = computeFFT(x.subarray(0, N2), N2, 2 * s);
        let right = computeFFT(x.subarray(N2)   , N2, 2 * s);

        for (let i = 0; i < N2; i++) {
            let li = left [i];
            let ri = right[i];

            let p = li;
            let q = roots[i] * ri;

            X[i] = p + q;
            X[i + N2] = p - q;
        }
    }

    return X;
}

function computeIFFT(x) {
    let X = computeFFT(x);

    for (let i = 0; i < X.length; i++) {
        X[i] = X[i] / X.length;
    }

    return X;
}

function cepstrum(x) {
    let X = computeFFT(x);
    
    for (let i = 0; i < X.length; i++) {
        X[i] = Math.log(Math.max(1e-10, Math.abs(X[i])));
    }

    return computeIFFT(X);
}

function getPitch(x) {
    let X = cepstrum(x);

    let bestFreq = null;

    for (let i = 0; i < X.length; i++) {
        if (bestFreq === null) {
            bestFreq = i;
        } else if (x[bestFreq] < x[i]) {
            bestFreq = i;
        }
    }

    return bestFreq;
}

function byteLogarithm(x) {
    let X = new Uint8ClampedArray(x.length);

    let sum = 0.0;

    for (let i = 0; i < x.length; i++) {
        x[i] = Math.log(Math.max(1e-20, x[i]));

        sum += x[i];
    }

    sum /= x.length;

    let lowest = Infinity;
    let highest = -Infinity;

    // get only the deviation
    for (let i = 0; i < x.length; i++) {
        x[i] = x[i] - sum;

        lowest = Math.min(lowest, x[i]);
        highest = Math.max(highest, x[i]);
    }

    // normalize
    for (let i = 0; i < x.length; i++) {
        let rel = (x[i] - lowest) / (highest - lowest);

        X[i] = rel * 255;
    }

    return X;
}