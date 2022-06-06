export function swapBits(n, p1, p2) {
    /* Move p1'th to rightmost side */
    const bit1 = (n >> p1) & 1;

    /* Move p2'th to rightmost side */
    const bit2 = (n >> p2) & 1;

    /* XOR the two bits */
    let x = (bit1 ^ bit2);

    /* Put the xor bit back to
    their original positions */
    x = (x << p1) | (x << p2);

    /* XOR 'x' with the original
    number so that the
    two sets are swapped */
    const result = n ^ x;
    return result;
}