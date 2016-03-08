/**
 * Created by Roman Rahman on 08.03.2016.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.mediaCapture = factory();
    }
})(this, function () {
    'use strict';

    var mediaCapture = {};

    mediaCapture.bindTo = function (video, options) {
        var captureOptions = {
            audio: !!options.audio,
            video: !!options.video,
            autoplay: !!options.autoplay
        };

        //if(options.width && options.height) {
        //    captureOptions.video = {
        //        width: options.width,
        //        height: options.height
        //    }
        //}

        if (options.facing) {
            if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                window.MediaStreamTrack.getSources(function (source_infos) {
                    var selected_source = null;

                    for (var i = 0; i != source_infos.length; ++i) {
                        var source_info = source_infos[i];
                        if (source_info.kind === 'video') {
                            if (!selected_source || (source_info.facing && source_info.facing == options.facing)) {
                                selected_source = source_info.id;
                            }
                        }
                    }

                    captureOptions.video = {
                        optional: [{facingMode: options.facing}, {sourceId: selected_source}]
                    };

                    startCapture(captureOptions);
                });
            }
        } else {
            startCapture(captureOptions);
        }
    };

    function startCapture(options) {
        options.onSuccess = options.onSuccess || function () {};
        options.onError = options.onError || function () {};

        if (navigator.getUserMedia) { // Standard
            navigator.getUserMedia(options, function (stream) {
                bindToDom(stream, video, options);
                options.onSuccess(stream);
            }, function (error) {
                options.onError(error);
            });
        } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
            navigator.webkitGetUserMedia(options, function (stream) {
                bindToDom(window.webkitURL.createObjectURL(stream), video, options);
                options.onSuccess(stream);
            }, function (error) {
                options.onError(error);
            });
        }
        else if (navigator.mozGetUserMedia) { // Firefox-prefixed
            navigator.mozGetUserMedia(options, function (stream) {
                bindToDom(window.URL.createObjectURL(stream), video, options)
                options.onSuccess(stream);
            }, function (error) {
                options.onError(error);
            });
        }
    }

    function bindToDom(stream, video, options) {
        video.src = stream;
        if (!!options.autoplay) video.play();
    }

    return mediaCapture;
});

// TODO: http://www.html5rocks.com/en/tutorials/getusermedia/intro/