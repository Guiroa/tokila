export function randomInt(length, charset = "") {
    if (!charset) charset = "1234567890";
    let res = "";
    while (length--) res += charset[(Math.random() * charset.length) | 0];
    return res;
}