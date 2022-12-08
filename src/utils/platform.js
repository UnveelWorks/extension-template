'use strict';

const header = [
	navigator.platform, 
	navigator.userAgent, 
	navigator.appVersion, 
	navigator.vendor
];

const dataos = [
    { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
    { name: 'Windows', value: 'Win', version: 'NT' },
    { name: 'iPhone', value: 'iPhone', version: 'OS' },
    { name: 'iPad', value: 'iPad', version: 'OS' },
    { name: 'Kindle', value: 'Silk', version: 'Silk' },
    { name: 'Android', value: 'Android', version: 'Android' },
    { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
    { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
    { name: 'Macintosh', value: 'Mac', version: 'OS X' },
    { name: 'Linux', value: 'Linux', version: 'rv' },
    { name: 'Palm', value: 'Palm', version: 'PalmOS' }
];

const databrowser = [
    { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
    { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
    { name: 'Safari', value: 'Safari', version: 'Version' },
    { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
    { name: 'Opera', value: 'Opera', version: 'Opera' },
    { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
    { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
];

function matchItem(string, data)
{
	let i = 0,
        j = 0,
        regex,
        regexv,
        match,
        matches,
        version;
    
    for (i = 0; i < data.length; i += 1) 
    {
        regex = new RegExp(data[i].value, 'i');
        match = regex.test(string);
        if (match) 
        {
            regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
            matches = string.match(regexv);
            version = '';
            if (matches) if (matches[1]) matches = matches[1];
            if (matches)
            {
                matches = matches.split(/[._]+/);
                for (j = 0; j < matches.length; j += 1) 
                {
                    if (j === 0) version += matches[j] + '.';
                    else version += matches[j];
                }
            } 
            else version = '0';

            return {
                name: data[i].name,
                version: parseFloat(version)
            };
        }
    }
    return { name: 'unknown', version: 0 };
}

const agent = header.join(' '),
    os = matchItem(agent, dataos),
    browser = matchItem(agent, databrowser);

export default { os: os, browser: browser };  