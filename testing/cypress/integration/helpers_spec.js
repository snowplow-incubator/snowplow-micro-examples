// to run this spec file move it to cypress/integration directory

import * as Micro from '../../jsm/helpers.js';


describe('tests helper functions of helpers.js', () => {

    context('tests: compare', () => {

        it('tests compare with null, numbers, strings, booleans', () => {

            // null
            expect(Micro.compare( null, null )).to.eq(true);
            expect(Micro.compare( null, [] )).to.eq(false);
            expect(Micro.compare( "not null", null )).to.eq(false);

            // numbers
            expect(Micro.compare( 1, 1 )).to.eq(true);
            expect(Micro.compare( 2.3, 0 )).to.eq(false);

            // strings
            expect(Micro.compare( "a", "a" )).to.eq(true);
            expect(Micro.compare( "a", "ab" )).to.eq(false);
            expect(Micro.compare( "", "b" )).to.eq(false);

            // booleans
            expect(Micro.compare( false, false )).to.eq(true);
            expect(Micro.compare( true, false )).to.eq(false);

        });


        it('tests compare with arrays', () => {

            // arrays and nested arrays
            expect(Micro.compare( [], [] )).to.eq(true);

            expect(Micro.compare( [],
                                  [1, 2] )).to.eq(true); // is that what we want?

            expect(Micro.compare( [1, 2],
                                  [] )).to.eq(false);

            expect(Micro.compare( [1, 2],
                                  [2] )).to.eq(false);

            expect(Micro.compare( [1, 2],
                                  [2, 1] )).to.eq(true);

            expect(Micro.compare( [1, 2, 3],
                                  [4, 2, 5, 3, 1, 6] )).to.eq(true);

            expect(Micro.compare( [1, [2, 3], 4],
                                  [5, 4, [3, 2, 0], 0, 1] )).to.eq(true);
        });


        it('tests compare with objects', () => {

            expect(Micro.compare( {}, {} )).to.eq(true);

            expect(Micro.compare( {}, {"a": 1} )).to.eq(true); // is that what we want?

            expect(Micro.compare( {"a": 1}, {} )).to.eq(false);

            expect(Micro.compare(
                {
                    "a": 1,
                    "b": 2
                },
                {
                    "a": 1,
                    "b": 3
                } ))
                .to.eq(false);

            expect(Micro.compare(
                {
                    "a": 1,
                    "b": 2
                },
                {
                    "b": 2,
                    "c": 3,
                    "a": 1
                } ))
                .to.eq(true);

        });


        it('tests compare with arrays of objects', () => {

            // expected, actual
            let exp, act;

            exp = [
                {
                    "a": 1,
                    "b": 2
                },
                {
                    "c": 3
                }
            ];
            act = [
                {
                    "c": 3,
                    "e": 5
                },
                {
                    "b": 2,
                    "a": 1
                },
                {
                    "d": 4
                }
            ];
            expect(Micro.compare(exp, act)).to.eq(true);


            exp = [
                {
                    "a": 1,
                    "b": 2
                },
                {
                    "c": 3
                }
            ];
            act = [
                {
                    "c": 3,
                    "e": 5
                },
                {
                    "b": 2,
                    "a": 2
                }
            ];
            expect(Micro.compare(exp, act)).to.eq(false);


            exp = [
                {
                    "a": 1
                },
                {
                    "c": [
                        {
                            "d": 4,
                            "e": {
                                "f": 6,
                                "g": [1, 2]
                            }
                        }
                    ]
                }
            ];
            act = [
                {
                    "z": 10,
                    "c": [
                        {
                            "e": {
                                "g": [3, 2, 1],
                                "f": 6,
                                "i": 2
                            },
                            "d": 4,
                            "h": 7
                        }
                    ]
                },
                {
                    "a": 1
                }
            ];
            expect(Micro.compare(exp, act)).to.eq(true);

        });


        it('tests compare with nested objects', () => {

            // expected, actual
            let exp, act_1, act_2;

            exp = {
                "a": {
                    "b": {
                        "c": [1, 2],
                        "d": "test",
                        "e": 5
                    },
                    "f": 1
                },
                "aa": [
                    {},
                    {
                        "bb": 1,
                        "cc": {
                            "dd": {
                                "ee": {
                                    "ff": 0
                                }
                            }
                        }
                    },
                    [
                        [0, 1],
                        {
                            "aaa": "bbb",
                            "ccc": [
                                {
                                    "ddd": 3.14
                                }
                            ]
                        },
                        0
                    ],
                    true
                ],
                "last": "thing"
            };

            // "innocent" diffs
            act_1 = {
                "diff1": 0,
                "a": {
                    "b": {
                        "c": [1, 2],
                        "diff2": 0,
                        "d": "test",
                        "e": 5
                    },
                    "diff3": [0, 0, 0],
                    "f": 1
                },
                "aa": [
                    {},
                    ["diff41", "diff42"],
                    {
                        "bb": 1,
                        "cc": {
                            "dd": {
                                "ee": {
                                    "ff": 0,
                                    "diff6": 0
                                },
                                "diff7": {}
                            }
                        },
                        "diff8": 0
                    },
                    [
                        [0, 1],
                        ["diff9"],
                        {
                            "aaa": "bbb",
                            "ccc": [
                                {
                                    "ddd": 3.14
                                }
                            ]
                        },
                        0
                    ],
                    true
                ],
                "last": "thing",
                "diff0": "last"
            };

            // pi
            act_2 = {
                "a": {
                    "b": {
                        "c": [1, 2],
                        "d": "test",
                        "e": 5
                    },
                    "f": 1
                },
                "aa": [
                    {},
                    {
                        "bb": 1,
                        "cc": {
                            "dd": {
                                "ee": {
                                    "ff": 0
                                }
                            }
                        }
                    },
                    [
                        [0, 1],
                        {
                            "aaa": "bbb",
                            "ccc": [
                                {
                                    "ddd": 3.1415  // only diff with exp
                                }
                            ]
                        },
                        0
                    ],
                    true
                ],
                "last": "thing"
            };

            expect(Micro.compare(exp, act_1)).to.eq(true);
            expect(Micro.compare(exp, act_2)).to.eq(false);

        });

    });

    context('tests: compare with base64decode', () => {

        it('an example', () => {

            const encoded = "eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy91bnN0cnVjdF9ldmVudC9qc29uc2NoZW1hLzEtMC0wIiwiZGF0YSI6eyJzY2hlbWEiOiJpZ2x1OmNvbS5zbm93cGxvd2FuYWx5dGljcy5zbm93cGxvdy9saW5rX2NsaWNrL2pzb25zY2hlbWEvMS0wLTEiLCJkYXRhIjp7InRhcmdldFVybCI6Imh0dHBzOi8vZG9jcy5zbm93cGxvd2FuYWx5dGljcy5jb20vIiwiZWxlbWVudElkIjoiIiwiZWxlbWVudENsYXNzZXMiOltdLCJlbGVtZW50VGFyZ2V0IjoiIiwiZWxlbWVudENvbnRlbnQiOiJEZW1vISJ9fX0";
            const expectInData = {"targetUrl":"https://docs.snowplowanalytics.com/"};

            expect(Micro.compare(expectInData, JSON.parse(Micro.base64decode(encoded))['data']['data'])).to.eq(true);

        });

    });

});
