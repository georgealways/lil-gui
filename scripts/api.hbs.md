# API

<div class="api-index">

{{#jsdocData}}

<div class="class">

## [**{{name}}**](#{{{name}}})
{{#children}}
  - [{{indexname}}](#{{{longname}}})
{{/children}}

</div>

{{/jsdocData}}

</div>

<!--endtoc-->

{{#jsdocData}}

# <a name="{{{name}}}"></a> {{name}}

{{#children}}

## <a name="{{{longname}}}"></a> {{{signature}}}{{{parens}}}

{{{description}}}

{{#examples}}
```js
{{{.}}}
```
{{/examples}}

{{#with params}}

{{#.}}
 - **{{name}}**{{#with description}} - {{{.}}}{{/with}}<br>
 <small>
{{#if defaultvalue}}Default: `{{{defaultvalue}}}`
{{else}}
{{#if optional}}Optional:
{{else}}Required: 
{{/if}}
{{#type.names}}`{{.}}`{{#unless @last}} or {{/unless}}{{/type.names}}
{{/if}}
</small>

{{/.}}
{{/with}}

{{#with returntype}}
**Returns**: `{{{.}}}`
{{/with}}


{{/children}}

{{/jsdocData}}
