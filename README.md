<p align="center">
  <img alt="ReacTyper Demo GIF" src="demo.gif">
  <br />
  <b>A React component that types.</b>
  <br />
  Inspired by <a href="https://github.com/cngu/vue-typer">vue-typer</a>.
</p>

```js
import Typer from 'reactyper';

<Typer spool={['🎉 ReacTyper']} />
```

- [Installation](#Installation)
- [Demo](#Demo)
- [Props](#Props)
  - [spool](#spool)
  - [repeats](#repeats)
  - [shuffle](#shuffle)
  - [initialAction](#initialAction)
  - [eraseOnComplete](#eraseOnComplete)
  - [eraseStyle](#eraseStyle)
  - [caretAnimationStyle](#caretAnimationStyle)
  - [preTypeDelay](#preTypeDelay)
  - [typeDelay](#typeDelay)
  - [preEraseDelay](#preEraseDelay)
  - [eraseDelay](#eraseDelay)
- [Events](#Events)
  - [onType](#onType)
  - [onTyped](#onTyped)
  - [onErase](#onErase)
  - [onErased](#onErased)
  - [onFinish](#onFinish)
- [Styles](#Styles)
- [License](#License)

## Installation

#### Node

    $ npm i reactyper

or

    $ yarn add reactyper

Then import:

```js
import Typer from 'reactyper';
```

#### Browser

```html
<script src="https://unpkg.com/reactyper/dist/reactyper.min.js">
```

And access via `window.Typer`.

## Props

Each prop is listed in the format `<prop>: <type> = <default-value>`. **Note:** The typer is considered *complete* when it has run once through the whole spool, then an additional number of `repeats` through the spool, and has erased the last string if `eraseOnComplete` is true.

#### `spool: string[] = ['React Typer']`
- Array of strings to type
- Empty strings will be ignored, Unicode characters are supported

#### `repeats: number = Infinity`
- Number of **additional** times to the **whole spool**

#### `shuffle: boolean = false`
- Whether or not to shuffle the spool on every run
- Shuffles on first run

#### `initialAction: 'typing' | 'erasing' = 'typing'`
- Specifies initial action of the typer, whether to start typing or erasing

#### `eraseOnComplete: boolean = false`
- Whether or not to erase text on typer completion, see note above.

#### `eraseStyle: 'backspace' | 'select' | 'select-all' | 'clear' = 'backspace'`
- Style of erasing:
  - `backspace`: Each character is removed and classed with `erased`
  - `select`: Each character is selected and classed with `selected`
  - `select-all`: All characters are selected and classed with `selected`
  - `clear`: All characters are removed immediately and classed with `erased`

#### `caretAnimationStyle: 'solid' | 'blink' | 'smooth' = 'blink'`
- Style of the caret's animation:
  - `solid`: Caret is just solid
  - `blink`: Caret blinks
  - `smooth`: Caret smoothly moves between 0 and 100% opacity 

#### `preTypeDelay: number = 70`
- Delay before the first type step in ms
- After this delay, the first character is typed immediately

#### `typeDelay: number = 70`
- Delay before every successive type step in ms

#### `preEraseDelay: number = 2000`
- Delay before the first erase step in ms
- After this delay, the first character is erased immediately

#### `eraseDelay: number = 250`
- Delay before every successive erase step in ms

## Events

#### `onType(typed: string)`
- Called after a character is typed, called in conjunction with `onTyped` for the last character
- `typed` : currently typed string

#### `onTyped(current: string)`
- Called after the whole word is typed
- `current`: string that finished typing

#### `onErase(erased: string)`
- Called after a character is erased, called in conjunction with `onErased` for last character
- `erased`: currently erased string

#### `onErased(current: string)`
- Called after the whole word is erased
- `current`: string that finished erasing in full

#### `onFinish()`
- Called after the typer finishes, i.e. when it runs `(repeats + 1) * spool.length` times

## Styles
The typer's styles are set to a relatively low specificity to allow overwriting them:

```css
.reactyper {
  /* styles for entire typer span */
}

.reactyper-char {
  /* styles for any character of the typer */
}

.reactyper-char.typed {
  /* styles for a character that has been typed */
}

.reactyper-char.untyped {
  /* styles for a character that has not been typed */
}

.reactyper-char.erased {
  /* styles for a character that has been erased */
  /* see eraseStyle */
}

.reactyper-char.selected {
  /* styles for a character that has been selected */
  /* see eraseStyle */
}

.reactyper-caret {
  /* styles for the caret span */
}

.reactyper-caret.blink {
  /* animation for a smooth cursor */
}

.reactyper-caret.smooth {
  /* animation for a smooth caret */
}
```


## License

© 2019-Present Andrew Li. [MIT](https://opensource.org/licenses/MIT) License. 