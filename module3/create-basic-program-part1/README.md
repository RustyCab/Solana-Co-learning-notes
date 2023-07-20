# 创建基本程序，第 1 部分 - 处理指令数据

## 长话短说

- 大多数程序支持多个离散指令 - 在编写程序时，您决定这些指令是什么以及必须伴随它们的数据是什么
- Rust枚举常用于表示离散的程序指令
-你可以使用`borsh crate`和`derive attribute`为Rust结构体提供`Borsh`反序列化和序列化功能
- Rust的匹配表达式可以根据提供的指令创建条件代码路径

---

## 概述

Solana程序的最基本要素之一是处理指令数据的逻辑。大多数程序支持多个相关功能，并使用指令数据的差异来确定要执行的代码路径。例如，传递给程序的指令数据中的两种不同数据格式可能表示创建新数据和删除相同数据的指令。

由于指令数据以字节数组的形式提供给程序的入口点，通常会创建一个Rust数据类型来表示指令，以便在代码中更方便地使用。本课程将介绍如何设置这样的类型，如何将指令数据反序列化为该格式，并根据传递给程序入口点的指令执行适当的代码路径。

---

### Rust 基础知识

在我们深入了解基本 Solana 程序的细节之前，让我们先讨论一下我们将在本课中使用的 Rust 基础知识。

#### 变量


Rust 中的变量赋值是通过 `let` 关键字进行的。

```rust
let age = 33;
```
Rust中的变量默认是不可变的，这意味着一旦设置了变量的值，就无法更改。为了创建一个在将来某个时刻我们希望改变的变量，我们使用`mut`关键字。使用这个关键字定义一个变量意味着它存储的值可以改变。

```rust
// compiler will throw error
let age = 33;
age = 34;

// this is allowed
let mut mutable_age = 33;
mutable_age = 34;
```

Rust编译器保证不可变变量确实不能改变，这样你就不必自己跟踪它。这使得你的代码更容易理解，并简化了调试过程。

---

#### 结构体

结构体（struct）是一种自定义的数据类型，它允许您将多个相关的值打包在一起并为其命名，以形成一个有意义的组。结构体中的每个数据都可以是不同的类型，并且每个数据都有与之关联的名称。这些数据片段被称为字段（fields），它们的行为类似于其他语言中的属性（properties）。

```rust
struct User {
    active: bool,
    email: String,
    age: u64
}
```

在我们定义了一个结构体之后，要使用它，我们需要为每个字段指定具体的值来创建一个该结构体的实例。

```rust
let mut user1 = User {
    active: true,
    email: String::from("test@test.com"),
    age: 36
};
```

要从结构体中获取或设置特定的值，我们使用点表示法。

```rust
user1.age = 37;
```

---

#### 枚举

枚举（或枚举类型）是一种数据结构，允许您通过列举其可能的变体来定义一种类型。一个枚举的示例可能如下所示：

```rust
enum LightStatus {
    On,
    Off
}
```
在这种情况下，`LightStatus`枚举有两个可能的变体：要么是开启，要么是关闭。

您还可以将值嵌入到枚举变体中，类似于将字段添加到结构中。

```rust
enum LightStatus {
    On {
        color: String
    },
    Off
}

let light_status = LightStatus::On { color: String::from("red") };
```

在这个例子中，将一个变量设置为`LightStatus`的`On`变体还需要设置`color`的值。

---

#### 匹配语句

匹配语句与C/C++中的switch语句非常相似。匹配语句允许您将一个值与一系列模式进行比较，然后根据匹配的模式执行代码。模式可以由字面值、变量名、通配符等组成。匹配语句必须包含所有可能的情况，否则代码将无法编译。

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25
    }
}
```

---

#### 实现

在Rust中，`impl`关键字用于定义类型的实现。函数和常量都可以在实现中定义。

```rust
struct Example {
    number: i32
}

impl Example {
    fn boo() {
        println!("boo! Example::boo() was called!");
    }

    fn answer(&mut self) {
        self.number += 42;
    }

    fn get_number(&self) -> i32 {
        self.number
    }
}
```

这里的函数`boo`只能在类型本身上调用，而不能在类型的实例上调用，就像这样：

```rust
Example::boo();
```

同时，`answer()`需要一个可变的`Example`实例，并且可以使用点语法调用：

```rust
let mut example = Example { number: 3 };
example.answer();
```

---

#### Trait 和 attributes

在此阶段您不会创建自己的`Trait`或`attributes`，因此我们不会提供对此的深入解释。但是，您将使用 `derivative` 属性宏和 `borsh crate` 提供的一些`Trait`，因此对每个特征有较高的了解非常重要。

`Trait`描述了类型可以实现的抽象接口。如果特征定义了函数 `bark()` 并且类型随后采用了该`Trait`，则该类型必须实现 `bark()` 函数。

[属性](https://doc.rust-lang.org/rust-by-example/attribute.html)将元数据添加到类型中，并且可用于许多不同的目的。

当您将[派生属性](https://doc.rust-lang.org/rust-by-example/trait/derive.html)添加到类型并提供一个或多个支持的Trait时，会在后台生成代码以自动实现该类型的Trait。我们很快就会提供一个具体的例子。

---

## 将指令表示为 Rust 数据类型

既然我们已经掌握了Rust的基础知识，那么让我们将其应用到Solana程序中。

往往情况下，程序会有多个功能。例如，你可能有一个作为笔记应用后端的程序。假设这个程序接受创建新笔记、更新现有笔记和删除现有笔记的指令。

由于指令具有离散的类型，它们通常非常适合使用枚举数据类型。

```rust
enum NoteInstruction {
    CreateNote {
        title: String,
        body: String,
        id: u64
    },
    UpdateNote {
        title: String,
        body: String,
        id: u64
    },
    DeleteNote {
        id: u64
    }
}
```

请注意，`NoteInstruction`枚举的每个变体都附带了嵌入数据，程序将使用这些数据来完成创建、更新和删除笔记的任务。

---

### 反序列化指令数据

指令数据以字节数组的形式传递给程序，因此您需要一种确定性地将该数组转换为指令枚举类型实例的方法。

在之前的模块中，我们使用`Borsh`进行客户端的序列化和反序列化。为了在程序端使用`Borsh`，我们使用`borsh crate`。这个`crate`提供了`BorshDeserialize`和`BorshSerialize`的特性，你可以使用`derive`属性将它们应用到你的类型上。

为了使反序列化指令数据变得简单，您可以创建一个表示数据的结构体，并使用派生属性将`BorshDeserialize Trait` 应用于该结构体。这将实现`BorshDeserialize`中定义的方法，包括我们将用于反序列化指令数据的`try_from_slice`方法。

请记住，结构体本身需要与字节数组中的数据结构相匹配。

```rust
#[derive(BorshDeserialize)]
struct NoteInstructionPayload {
    id: u64,
    title: String,
    body: String
}
```

---

一旦创建了这个结构体，您可以为您的指令枚举创建一个实现，以处理与反序列化指令数据相关的逻辑。通常会在一个名为“`unpack`”的函数内完成此操作，该函数接受指令数据作为参数，并返回具有反序列化数据的适当枚举实例。


将程序结构化为期望第一个字节（或其他固定数量的字节）作为程序应该运行的指令的标识符是标准做法。这可以是一个整数或字符串标识符。在这个例子中，我们将使用第一个字节，并将整数`0`、`1`和`2`映射到分别表示创建、更新和删除的指令。

```rust
impl NoteInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Take the first byte as the variant to
        // determine which instruction to execute
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        // Use the temporary payload struct to deserialize
        let payload = NoteInstructionPayload::try_from_slice(rest).unwrap();
        // Match the variant to determine which data struct is expected by
        // the function and return the TestStruct or an error
        Ok(match variant {
            0 => Self::CreateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id
            },
            1 => Self::UpdateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id
            },
            2 => Self::DeleteNote {
                id: payload.id
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```

---

这个例子有很多内容，所以让我们一步一步来：

1. 该函数首先对输入参数使用 `split_first` 函数以返回一个元组。第一个元素变量是字节数组中的第一个字节，第二个元素剩余是字节数组的其余部分。

2. 然后，该函数使用 `NoteInstructionPayload` 上的 `try_from_slice` 方法将字节数组的其余部分反序列化为名为 `Payload` 的 `NoteInstructionPayload` 实例

3. 最后，该函数使用变量上的匹配语句来使用有效负载中的信息创建并返回适当的枚举实例

请注意，该函数中存在我们尚未解释的 Rust 语法。 `ok_or` 和 `unwrap` 函数用于错误处理，将在另一课中详细讨论。

---

### 程序逻辑

通过一种将指令数据反序列化为自定义的Rust类型的方法，您可以根据传入程序入口点的指令来使用适当的控制流来执行程序中的不同代码路径。

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // Call unpack to deserialize instruction_data
    let instruction = NoteInstruction::unpack(instruction_data)?;
    // Match the returned data struct to what you expect
    match instruction {
        NoteInstruction::CreateNote { title, body, id } => {
            // Execute program code to create a note
        },
        NoteInstruction::UpdateNote { title, body, id } => {
            // Execute program code to update a note
        },
        NoteInstruction::DeleteNote { id } => {
            // Execute program code to delete a note
        }
    }
}
```

对于只有一两条指令需要执行的简单程序，将逻辑写在匹配语句内部可能是可以的。对于有许多不同可能指令需要匹配的程序，如果每个指令的逻辑都写在单独的函数中，并在匹配语句内部进行调用，你的代码将更易读。


---

### 程序文件结构

Hello World 课程的程序非常简单，可以限制在一个文件中。但随着程序复杂性的增加，维护一个保持可读性和可扩展性的项目结构非常重要。这涉及到将代码封装到函数和数据结构中，就像我们到目前为止所做的那样。但它还涉及将相关代码分组到单独的文件中。

例如，我们到目前为止所处理的代码中，有很大一部分是关于定义和反序列化指令的。这段代码应该存在自己的文件中，而不是写在与入口点相同的文件中。这样做的话，我们将会有两个文件，一个是程序的入口点，另一个是指令代码。


- `lib.rs`
- `instruction.rs`

一旦您开始像这样拆分程序，您将需要确保将所有文件注册在一个中心位置。我们将在 `lib.rs` 中执行此操作。您必须像这样注册程序中的每个文件。

```rust
// This would be inside lib.rs
pub mod instruction;
```

此外，您希望通过其他文件中的 `use` 语句使用的任何声明都需要以 `pub` 关键字开头：

```rust
pub enum NoteInstruction { ... }
```

---

## 演示

对于本课程的演示，我们将构建出我们在第一模块中使用的电影评论程序的前半部分。该程序存储用户提交的电影评论。

现在，我们将专注于反序列化指令数据。下一课将专注于程序的后半部分。

---

### 1. Entry point

我们将再次使用 [Solana Playground](https://beta.solpg.io/) 来构建这个程序。 Solana Playground 会在浏览器中保存状态，因此您在上一课中所做的所有操作可能仍然存在。如果是，让我们清除当前 `lib.rs` 文件中的所有内容。

在 `lib.rs` 中，我们将引入以下包，并使用入口点宏定义程序的入口点。

```rust
use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::AccountInfo,
};

// Entry point is a function call process_instruction
entrypoint!(process_instruction);

// Inside lib.rs
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    Ok(())
}
```

---

### 2. 反序列化指令数据

在我们继续处理器逻辑之前，我们应该定义我们支持的指令并实现我们的反序列化函数。

为了提高可读性，让我们创建一个名为`instruction.rs`的新文件。在这个新文件中，添加`BorshDeserialize`和`ProgramError`的`use`语句，然后创建一个`MovieInstruction`枚举，其中包含一个`AddMovieReview`变体。这个变体应该包含标题、评分和描述的嵌入值。

```rust
use borsh::{BorshDeserialize};
use solana_program::{program_error::ProgramError};

pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    }
}
```

---


接下来，定义一个`MovieReviewPayload`结构体。它将作为一个中间类型用于反序列化，因此应该使用`derive`属性宏为`BorshDeserialize trait`提供默认实现。

```rust
#[derive(BorshDeserialize)]
struct MovieReviewPayload {
    title: String,
    rating: u8,
    description: String
}
```

最后，为 `MovieInstruction` 枚举创建一个实现，该实现定义并实现一个名为 `unpack` 的函数，该函数采用字节数组作为参数并返回 `Result` 类型。这个函数应该：

1. 使用 `split_first` 函数将数组的第一个字节与数组的其余部分分开
2. 将数组的其余部分反序列化为 `MovieReviewPayload` 的实例
3. 如果数组的第一个字节为 `0`，则使用匹配语句返回 `MovieInstruction` 的 `AddMovieReview` 变体，否则返回程序错误

```rust
impl MovieInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Split the first byte of data
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        // `try_from_slice` is one of the implementations from the BorshDeserialization trait
        // Deserializes instruction byte data into the payload struct
        let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
        // Match the first byte and return the AddMovieReview struct
        Ok(match variant {
            0 => Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```

---

### 3. 程序逻辑

在处理指令反序列化后，我们可以返回到`lib.rs`文件中处理一些程序逻辑。

请记住，由于我们将代码添加到不同的文件中，因此我们需要使用 `pub mod` 指令将其注册到 `lib.rs` 文件中。然后我们可以添加一条 use 语句将 `MovieInstruction` 类型引入作用域。

```rust
pub mod instruction;
use instruction::{MovieInstruction};
```

接下来，让我们定义一个新函数 `add_movie_review` ，它将 `program_id`、`accounts`、`title`、 `rating` 和 `description` 作为参数。它还应该返回一个 `ProgramResult` 实例。在这个函数中，我们现在只需记录我们的值，我们将在下一课中重新讨论该函数的其余实现。

```rust
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {

    // Logging instruction data that was passed in
    msg!("Adding movie review...");
    msg!("Title: {}", title);
    msg!("Rating: {}", rating);
    msg!("Description: {}", description);

    Ok(())
}
```

完成后，我们可以从 `process_instruction` （我们设置为入口点的函数）调用 `add_movie_review` 。为了将所有必需的参数传递给函数，我们首先需要调用在 `MovieInstruction` 上创建的`unpack`，然后使用匹配语句来确保我们收到的指令是 `AddMovieReview` 变体。

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // Unpack called
    let instruction = MovieInstruction::unpack(instruction_data)?;
    // Match against the data struct returned into `instruction` variable
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            // Make a call to `add_move_review` function
            add_movie_review(program_id, accounts, title, rating, description)
        }
    }
}

```

就像这样，您的程序应该具有足够的功能来记录提交交易时传入的指令数据！


从Solana Program中构建和部署您的程序，就像在上一课中一样。如果您在上一课中没有更改程序ID，它将自动部署到相同的ID。如果您希望它有一个单独的地址，您可以在部署之前从playground生成一个新的程序ID。


您可以通过使用正确的指令数据提交交易来测试您的程序。为此，请随意使用此[脚本](https://github.com/Unboxed-Software/solana-movie-client)或我们在序列化自定义指令数据课程中构建的[前端](https://github.com/Unboxed-Software/solana-movie-frontend)。在这两种情况下，请确保将程序的程序 ID 复制并粘贴到源代码的适当区域，以确保测试正确的程序。

如果您在继续之前需要花更多时间观看此演示，请这样做！如果遇到困难，您还可以查看程序[解决方案代码](https://beta.solpg.io/62aa9ba3b5e36a8f6716d45b)。

---

## 挑战

对于本课程的挑战，尝试复制第一模块的学生介绍程序。回想一下，我们创建了一个前端应用程序，让学生们可以介绍自己！该程序接收用户的姓名和简短留言作为指令数据，并在链上创建一个账户来存储这些数据。

利用你在本课程中学到的知识，构建一个学生介绍程序，使得当程序被调用时，能够将用户提供的姓名和信息打印到程序日志中。

您可以通过构建我们在序列化自定义指令数据课程中创建的[前端](https://github.com/Unboxed-Software/solana-student-intros-frontend/tree/solution-serialize-instruction-data)来测试您的程序，然后在 Solana Explorer 上检查程序日志。请记住将前端代码中的程序 ID 替换为您已部署的程序 ID。

如果可以的话，尝试独立完成此操作！但如果您遇到困难，请随时参考[解决方案代码](https://beta.solpg.io/62b0ce53f6273245aca4f5b0)。
