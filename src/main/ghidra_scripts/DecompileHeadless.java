/* ###
 * IP: GHIDRA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//Decompile an entire program

import java.io.File;
import java.util.*;

import ghidra.app.script.GatherParamPanel;
import ghidra.app.script.GhidraScript;
import ghidra.app.util.Option;
import ghidra.app.util.exporter.CppExporter;
import ghidra.program.model.listing.Program;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;

public class DecompileHeadless extends GhidraScript {

	@Override
	public void run() throws Exception {
		FunctionIterator functions = currentProgram.getFunctionManager().getFunctions(true);
		Map<String, String> functionsCodeMap = new HashMap<>();

		DecompInterface decompiler = setUpDecompiler(currentProgram);

		for (Function function : functions) {
			DecompileResults results = decompiler.decompileFunction(function, 0, monitor);
			if (results.decompileCompleted()) {
				String decompiledFunction = results.getDecompiledFunction().getC();
				functionsCodeMap.put(function.getName(), decompiledFunction);
			}
		}

		for (Map.Entry<String, String> entry : functionsCodeMap.entrySet()) {
			String functionName = entry.getKey();
			String functionCode = entry.getValue();

			println("Function Name: " + functionName);
			println("Decompiled Code:");
			Scanner scanner = new Scanner(functionCode);
			while (scanner.hasNextLine()) {
				println(scanner.nextLine());
			}
			scanner.close();
			println(); // Add an extra newline for readability between functions
		}
	}

	private DecompInterface setUpDecompiler(Program program) {
		DecompInterface decompiler = new DecompInterface();
		decompiler.openProgram(program);
		return decompiler;
	}
}