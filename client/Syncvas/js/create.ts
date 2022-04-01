/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param {String} type Type of `HTMLElement` to be created
 * @param {Object} props Optional properties of the `HTMLElement` to be created
 * @param {Array<Node | string>} children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement`
 */
export default function create<K extends keyof HTMLElementTagNameMap>(
    type: K,
    props?: any,
    children?: Array<Node | string>
): HTMLElementTagNameMap[K] {
    if (!type) throw new TypeError("Empty HTMLElement type: " + type);
    let dom = document.createElement(type);
    if (props) Object.assign(dom, props);
    if (children) {
        for (let child of children) {
            if (typeof child != "string") dom.appendChild(child);
            else dom.appendChild(document.createTextNode(child));
        }
    }
    return dom;
}
