{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "csrc/addon.cc",

        "csrc/woff2/glyph.cc",
        "csrc/woff2/font.cc",
        "csrc/woff2/normalize.cc",
        "csrc/woff2/table_tags.cc",
        "csrc/woff2/transform.cc",
        "csrc/woff2/variable_length.cc",
        "csrc/woff2/woff2_common.cc",
        "csrc/woff2/woff2_enc.cc",

        "csrc/enc/backward_references.cc",
        "csrc/enc/block_splitter.cc",
        "csrc/enc/brotli_bit_stream.cc",
        "csrc/enc/encode.cc",
        "csrc/enc/encode_parallel.cc",
        "csrc/enc/entropy_encode.cc",
        "csrc/enc/histogram.cc",
        "csrc/enc/literal_cost.cc",
        "csrc/enc/metablock.cc",
        "csrc/enc/streams.cc"
      ],
      "include_dirs"  : [
            "<!(node -e \"require('nan')\")"
      ],
      "cflags": [
        "-std=c++11 -w"
      ],
      "conditions": [
        [ "OS!=\"win\"", {
          "cflags+": [ "-std=c++11" ],
          "cflags_c+": [ "-std=c++11" ],
          "cflags_cc+": [ "-std=c++11" ]
        }],
        [ "OS==\"mac\"", {
          "xcode_settings": {
            "OTHER_CPLUSPLUSFLAGS": [ "-std=c++11", "-stdlib=libc++", "-w" ],
            "OTHER_LDFLAGS": [ "-stdlib=libc++" ],
            "MACOSX_DEPLOYMENT_TARGET": "10.7"
          }
        }]
      ]
    }
  ]
}
