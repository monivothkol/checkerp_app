/**
 * PKCE (Proof Key for Code Exchange) Utility
 * RFC 7636 compliant
 */

import CryptoJS from "crypto-js";
export class PKCEUtil {

    private static readonly CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    /**
     * Generate a high-entropy code_verifier
     * Length must be between 43–128 characters
     */
    static generateCodeVerifier(length = 64): string {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Generate code_challenge using S256 method
     * BASE64URL(SHA256(code_verifier))
     */
    static async generateCodeChallenge(
        codeVerifier: string
    ): Promise<string> {
        // const encoder = new TextEncoder();
        // const data = encoder.encode(codeVerifier);
        // const digest = await (window as any).crypto?.subtle.digest("SHA-256", data);
        // const hash = new Uint8Array(digest);
        const hash = CryptoJS.SHA256(codeVerifier);
        return PKCEUtil.base64UrlEncode(hash);
    }

    /**
     * Base64 URL encode (RFC 4648 §5)
     */
    // private static base64UrlEncode(bytes: Uint8Array): string {
    //     let binary = "";
    //     for (const b of bytes) {
    //         binary += String.fromCharCode(b);
    //     }

    //     return btoa(binary)
    //         .replace(/\+/g, "-")
    //         .replace(/\//g, "_")
    //         .replace(/=+$/, "");
    // }

    private static base64UrlEncode(wordArray: CryptoJS.lib.WordArray): string {
        return CryptoJS.enc.Base64.stringify(wordArray)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    /**
     * Generate both verifier & challenge together
     */
    static async generatePKCEPair(): Promise<{
        codeVerifier: string;
        codeChallenge: string;
        method: "S256";
    }> {
        const codeVerifier = PKCEUtil.generateCodeVerifier();
        const codeChallenge = await PKCEUtil.generateCodeChallenge(codeVerifier);

        return {
            codeVerifier,
            codeChallenge,
            method: "S256"
        };
    }
}
