(function(){
    "use strict";
    const
        NSgeneral = "com.lyndir.masterpassword",
        NSlogin = "com.lyndir.masterpassword.login",
        NSanswer = "com.lyndir.masterpassword.answer";
    var keyofs = undefined;


    function encode_utf8(s) {
      return unescape(encodeURIComponent(s));
    }

    function mp_key(password, name, lenoverride) {
        var key = Module.ccall('mp_key', 'number', ['string','string', 'number'],
                [password, name, lenoverride]);
        if (!key)
        {
            throw new Error("mp_key failed");
        }
        return new Uint8Array(Module.HEAPU8.subarray(key, key+64));
    }

    function mp_seed(key, site, count, scope, context, lenoverride) {
        Module.HEAPU8.set(key, keyofs);
        var hmac = Module.ccall('mp_seed', 'number', ['string','number','string', 'number', 'number'],
                [site, count, scope, context, lenoverride]);
        if (!hmac) {
            throw new Error("mp_seed failed");
        }
        hmac = new Uint8Array(Module.HEAPU8.subarray(hmac, hmac + 32));
        return hmac;
    }

    function sha256_digest(data) {
        if (data.length > 64) {
            throw new Error("only for use with masterKey!");
        }
        Module.HEAPU8.set(data, keyofs);
        return Module.ccall('sha256_digest', 'string', ['number','number'], [keyofs, 64]);
    }

    function char_template(type, hmac) {
        var template;
        switch (type) {
            case 'i': template = ["nnnn"]; break;
            case 'b': template = ["aaanaaan", "aannaaan", "aaannaaa"]; break;
            case 's': template = ["Cvcn"]; break;
            case 'm': template = ["CvcnoCvc", "CvcCvcno"]; break;
            case 'l': template = ["CvcvnoCvcvCvcv", "CvcvCvcvnoCvcv", "CvcvCvcvCvcvno", "CvccnoCvcvCvcv", "CvccCvcvnoCvcv",
                                  "CvccCvcvCvcvno", "CvcvnoCvccCvcv", "CvcvCvccnoCvcv", "CvcvCvccCvcvno", "CvcvnoCvcvCvcc",
                                  "CvcvCvcvnoCvcc", "CvcvCvcvCvccno", "CvccnoCvccCvcv", "CvccCvccnoCvcv", "CvccCvccCvcvno",
                                  "CvcvnoCvccCvcc", "CvcvCvccnoCvcc", "CvcvCvccCvccno", "CvccnoCvcvCvcc", "CvccCvcvnoCvcc",
                                  "CvccCvcvCvccno"]; break;
            case 'x': template = ["anoxxxxxxxxxxxxxxxxx","axxxxxxxxxxxxxxxxxno"]; break;
            case 'nx':
            case 'n': template = ["cvccvcvcv"]; break;
            case 'px':
            case 'p': template = ["cvcc cvc cvccvcv cvc", "cvc cvccvcvcv cvcv", "cv cvccv cvc cvcvccv"]; break;
            default:
                throw new Error("unknown password type '" + type + "'");
        }
        return template[hmac[0] % template.length];
    }

    function password_from_template(template, hmac) {
        var i, passChars, retval = [];
        for (i = 0; i < template.length; i++) {
            switch(template[i])
            {
                case 'V': passChars = "AEIOU"; break;
                case 'C': passChars = "BCDFGHJKLMNPQRSTVWXYZ";break;
                case 'v': passChars = "aeiou"; break;
                case 'c': passChars = "bcdfghjklmnpqrstvwxyz"; break;
                case 'A': passChars = "AEIOUBCDFGHJKLMNPQRSTVWXYZ"; break;
                case 'a': passChars = "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz"; break;
                case 'n': passChars = "0123456789"; break;
                case 'o': passChars = "@&%?,=[]_:-+*$#!'^~;()/."; break;
                case 'x': passChars = "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()"; break;
                case ' ': passChars = " "; break;
                default:
                    throw new Error("Unknown character class '"+template[i]+"'");
            }
            retval.push(passChars[hmac[i+1] % passChars.length]);
        }
        return retval.join('');
    }

    function encode(key, site, count, type, lenoverride) {
        lenoverride = typeof lenoverride !== 'undefined' ? lenoverride : 0;
        var scope,
            hmac;

        switch (type){
            case 'nx': scope = NSlogin; break;
            case 'px': scope = NSanswer; break;
            default: scope = NSgeneral; break;
        }
        hmac = mp_seed(key, site, count, scope, null, lenoverride);

        return password_from_template(
            char_template(type, hmac),
            hmac);
    }

window.mpw=function(name, password, version){
    version = typeof version !== 'undefined' ? version : 3;
    var key,
        lenoverride = 0;
    keyofs = typeof keyofs !== 'undefined' ? keyofs : Module.ccall('get_masterkey', 'number', [], []);

    if (version<3) {
        lenoverride = name.length;
    }

    key = mp_key(password, name, lenoverride);

    return {
        sitepassword : function(site, count, type) {
            if (version < 2)
                return encode(key, site, count, type, site.length);
            else
                return encode(key, site, count, type);
        },
        key_id : function() { return sha256_digest(key); },
        v2_compatible : function() { return name.length == encode_utf8(name).length; }
    };
};
}());
