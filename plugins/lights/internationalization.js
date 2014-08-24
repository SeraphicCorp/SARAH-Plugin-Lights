var text = {
    'language-not-found': "Language not found",
    'key-not-found': "Key not found",
    'fr': {
        'request': "Requête",
        'philips-hue-bridge-unreachable': "Impossible de commander le pont Philips Hue",
        'philips-hue-incomplete-configuration': "Configuration Philips Hue invalide",
        'philips-hue-user-created': "Utilisateur Philips Hue créé",
        'philips-hue-user-configuration': "Configuration de l'utilisateur du pont Philips Hue",
        'executing-order': "D'accord, je m'en occupe",
        'is-an-unknown-type': " n'est pas un type connu",
        'is-an-unknown-group': " n'est pas un groupe connu",
        'is-an-unknown-operation': " n'est pas une opération connue",
        'is-an-unimplemented-operation': " n'est pas une opération possible pour "
    }
};

var translationEngineFactory = function(language) {
    return function(key) {
        if (typeof text[language] === 'undefined') {
            log(text['Language not found']);
            return key;
        }
        if (typeof text[language][key] === 'undefined') {
            log(text['Key not found']);
            return key;
        }
        return text[language][key];
    };
};

exports.translationEngineFactory = translationEngineFactory;