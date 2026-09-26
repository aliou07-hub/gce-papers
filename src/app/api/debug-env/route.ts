import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic endpoint. Finds the first character position where
 * the live SUPABASE_SERVICE_ROLE_KEY env var diverges from its known-correct
 * value, using truncated SHA-256 prefix hashes — the real key is never
 * embedded in source and never appears in the response. Remove after use.
 */
const EXPECTED_PREFIX_HASHES = [
  "3f79bb7b435b0532","2bdd94c004581aa9","f73ac862d70c9aff","0b20dcfef77f42b7","508f1f8175f2ad4b","8fde85cf17f211d9","0da5994383935921","55fec599d7049c41","c1b082973413f609","a073386d97e29cea","eb5403dc8a88450b","d002554eebb95fc4","9ec8b449c76b7f48","2b2de13ae1bc54e1","faf15f964cd849a5","c07454996a41855a","34a6ba52a51e3ec3","0f0f4e73b8cd5c7f","ae469000d6e3d517","e8d3559ba2a64653","4d582c8c5b3ecb88","1c065416ac6f6558","3f82d05e6253b3a4","0921e26e7d9298bf","3aa3b19396daa118","c737dafa6ec3e5fa","d5ab0f887548cc07","a7694fd280c89e8e","8b001780308ccac6","0c82874f61ff487e","9a51765bbfec9dc8","9b7df9abf11052a4","8beabe55948ed5d6","39cc1159810cf73d","be6238a33e895a59","d328d517e09060d1","1ddfd0f000165f3c","b0736f6ab08eee4a","71d5367e28a2ccb2","6c2da658cf4d8c17","40a6834ce7b9728d","c1b9973db5067744","b9cf351a8c9a69c0","f2decd7274847282","945f4d18486f37f7","33edd828b69dd49e","0ea4168a99717156","5ee3d6802ee7bd40","e33d64fbedbcac0d","4a7d2dec8a6366f4","3adf07096295a61d","c5919b4493eb28c0","b9d13479b560d1e1","f7474f89532598cc","9c1851f76451b38b","dac9bdc0fab5b983","3ef89f846f87005d","92d84e548286480d","df2899d1b791d24f","143ecf06d27e7a40","d4a4831245986197","115f39ceea97b200","3bd17ad7a2337423","2b71957338f26630","425f184b74b24370","854e72a8012d17e4","8e2953417a1d76bc","5082ed7d4ce433e1","4ddcfc29fc8a97c8","cdb883f11c70bb19","ae292a5cf04ab9b3","2e2e995aa7f1b98c","93c3f4cf2642f65c","459950b41ad03556","e0511363fe1b7509","cff5efb4c6037e16","bb231236f6921a95","17906a74e6683c29","4f92cfc03e0c50f1","c4c20ea77e6c93e1","d0da305219be5679","3ec69f4c5ae0af4c","c76ee6531f1f92a4","a4a9ecf8803c622d","b2d841b5cca0df47","87e38c59399c6de4","aa68d6ea0a0b8f76","d834c667dbbbec18","e4a3ac0285722262","9c38d937a2470d4d","092c6d7ee5dae405","37ef0ebd0367008e","ff690b4048953968","3a18b6ce6df2c8ae","99706d713470bbda","ee0727fb942f15e4","b0ff82872f794f68","97adad3255ab6d9c","9790f384d3c8f07b","bc4343a7a79f0dcc","1122d5be6aae4d46","1ce55d8fa0a0e5e0","000de6a629bdd5db","20f1d99085ef0400","12a14f26d1cacbce","60194b95fa68d052","4f39cfffd0d8ccf7","0498db6ce0244de1","cb573d98b9e738ca","83291fb371dce692","5141285c0e4b2944","20776e7ab47a5dcd","7f36b54783d70f88","4a2c866a89316c27","68e9e38b80c73020","d8355231a9b866cd","0fe9b4b99ddfeb0f","78f189ada7952a44","fca39f167644bf56","39f53409f7d50877","3f6ed0fe0aec7a72","e59cbebe65251af5","1cae4e4aa07d4f55","edf30ba72e7d0e8c","038018ff19a8ac7c","0c6b429ef634707f","00275ee324f604f4","a9e2171be30be8a6","2fd9c40aba991e9b","78bf5977a0ca92ac","ecf8dd3680197e9f","01fa388fe5051895","db4bcad09890f5e0","03e38d263d288604","29f2968359b86c88","4c9b253240149f14","0238d4fb20baf51f","d4c6e94882d87d91","379fb503e410f02f","57325831482d7156","210cfbdbf8bda9ce","df513fc360479a78","f7b227a0b6935a17","ff99ae69701516b6","fe42bd139158133a","555f4875307e154b","1366881ef790be57","da7fa16f067a56a2","3b7730c7ae82a3f6","15ca084c1458d8d6","af929bf723c7920b","7f09f167eeccccd7","d5089e2a81d944b9","868a1454ee5958c9","b69c25f96f79e2fa","75b27177ded30aa1","e7394854d800678a","2cb12fc14e82166a","d0a4f4aeabc2dd18","966638c93bc4e8dd","08b0f8e031a2b429","28aa79d6967d9b08","78c341c1251d6550","0c380274eb186976","d84c28cf7967c3c2","32ef7121371ff2e1","61d6b6ce38feb0fc","e884eaf4c03de878","84f43dc6191c7b84","45ea51e0ac9ce45a","21d75af6cac5ce02","fe547ad978effc06","6a0825fb5de56596","b3417eb87cbbcacb","57370b1d85f42481","ff7df0f254dcecb8","9dd4dccd238a9767","bd2531797522d9b1","c62bf20ff6a59fa3","2abf3cf21a24aa20","f64f207a04d610f3","52caf0a6872860aa","32b46fd1890c9c35","71236021e71679d5","ac54033b70edfcdf","985e8d0dfbe48f85","95709bf7ccd7c5ef","f27385afac075314","5cc2889ced79748f","f843390b18e56d8e","346c048ae5d39b3b","9709fb9fad735c1a","d001bd3c4f0592d3","c270ddb708426525","cdff4576fede7432","11f32cf2a7c37668","c07e0f37aed4ef0b","bfae86f84934bf35","b1f461766de3466d","ffdd63a47aa30900","36f4707d9708a607","c1f090e129d2603a","e7b9196e37769b65","31a83173461adf7e","12109fc15b4de208","56bbe8627e1c3c99","038a334f27588973","755c5544a8f46d9a","82f0278e842a806c","4c8e0e6e4ba1a307","11a09ae2d4dfcfbc","a3b9eb0f8a9bab2c","33f5f5eeda16031f","427a6c9a6d60e346","67557cae18f25a67","e91ee491e3b536b8","362b9cfd26d2fbd0","2b16fcd4f7fbad87","10c08532f5a37f34",
];

function prefixHash(v: string, len: number) {
  return crypto.createHash("sha256").update(v.slice(0, len)).digest("hex").slice(0, 16);
}

export async function GET() {
  const actual = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  let firstDiffIndex = -1;
  for (let i = 0; i < EXPECTED_PREFIX_HASHES.length; i++) {
    if (prefixHash(actual, i + 1) !== EXPECTED_PREFIX_HASHES[i]) {
      firstDiffIndex = i;
      break;
    }
  }

  return NextResponse.json({
    actualLength: actual.length,
    expectedLength: EXPECTED_PREFIX_HASHES.length,
    matchesFully: firstDiffIndex === -1 && actual.length === EXPECTED_PREFIX_HASHES.length,
    firstDiffIndex,
  });
}
