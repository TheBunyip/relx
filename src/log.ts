
export function log(str: string, prefix?: string): void {
    console.log(prefix || '#', sentenceCase(str) + '.');
}

function sentenceCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}